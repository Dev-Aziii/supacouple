import { supabase } from '../supabase/client';
import { couplesRepository, type Couple } from '../repositories/couplesRepository';
import { invitationsRepository, type Invitation } from '../repositories/invitationsRepository';
import { usersRepository } from '../repositories/usersRepository';
import { notificationRepository } from '../repositories/notificationRepository';
import { generateInviteCode as genCode } from '../../utils/relationship';
import { normalizeError } from '../errors';
import type { UserProfile } from '../../types/user';

export interface ValidationResult {
  valid: boolean;
  message?: string;
  invitation?: Invitation | null;
  senderProfile?: UserProfile | null;
}

export interface PendingInvitesResult {
  sent: Invitation[];
  received: Invitation[];
}

export class CoupleService {
  /**
   * Helper to generate unique un-ambiguous invite code.
   */
  generateInviteCode(): string {
    return genCode(8);
  }

  /**
   * Fetch current authenticated user's couple record and partner profile.
   */
  async getCurrentCouple(): Promise<{ couple: Couple | null; partner: UserProfile | null }> {
    try {
      const userProfile = await usersRepository.getCurrentProfile();
      if (!userProfile) return { couple: null, partner: null };

      let partner: UserProfile | null = null;
      if (userProfile.partnerId) {
        partner = await usersRepository.getById(userProfile.partnerId);
      }

      const couple = await couplesRepository.getActiveCoupleForUser(userProfile.id, userProfile.partnerId);

      return { couple, partner };
    } catch (err) {
      console.error('[CoupleService] getCurrentCouple error:', err);
      return { couple: null, partner: null };
    }
  }

  /**
   * Create an invitation to pair with another user.
   */
  async createInvite(recipientEmail: string, _anniversary?: string): Promise<Invitation> {
    try {
      const currentProfile = await usersRepository.getCurrentProfile();
      if (!currentProfile) throw new Error('User not authenticated');

      const cleanEmail = recipientEmail.trim().toLowerCase();

      // Step 5: Prevent invalid states
      if (currentProfile.email.toLowerCase() === cleanEmail) {
        throw new Error('You cannot send an invitation to yourself');
      }

      if (currentProfile.partnerId) {
        throw new Error('You already have an active partner');
      }

      // Check if user already has an active couple
      const existingCouple = await couplesRepository.getActiveCoupleForUser(currentProfile.id);
      if (existingCouple) {
        throw new Error('You are already part of an active couple');
      }

      // Check existing pending invites from this sender
      const pendingSent = await invitationsRepository.getPendingBySender(currentProfile.id);
      const duplicateInvite = pendingSent.find(
        (inv) => inv.email.toLowerCase() === cleanEmail && inv.status === 'pending'
      );

      if (duplicateInvite) {
        throw new Error('An active invitation has already been sent to this email');
      }

      // Generate unique invite code
      let code = this.generateInviteCode();
      let attempts = 0;
      while (attempts < 5) {
        const existing = await invitationsRepository.getByCode(code);
        if (!existing) break;
        code = this.generateInviteCode();
        attempts++;
      }

      // Calculate expiration: 7 days from now
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const invitation = await invitationsRepository.create({
        inviteCode: code,
        email: cleanEmail,
        senderId: currentProfile.id,
        expiresAt,
      });

      // Try to find receiver by email to deliver notification directly if registered
      try {
        const receiverProfile = await usersRepository.getByEmail(cleanEmail);
        if (receiverProfile) {
          await notificationRepository.create({
            recipientId: receiverProfile.id,
            senderId: currentProfile.id,
            type: 'invite',
            title: 'New Couple Invitation',
            body: `${currentProfile.displayName || 'Someone'} sent you a couple invitation!`,
          });
        }
      } catch (notifErr) {
        console.warn('[CoupleService] Client notification insert skipped (DB trigger handles auto-delivery):', notifErr);
      }

      return invitation;
    } catch (err) {
      console.error('[CoupleService] createInvite error:', err);
      throw normalizeError(err);
    }
  }

  /**
   * Validate an invitation code before accepting.
   */
  async validateInvite(code: string): Promise<ValidationResult> {
    try {
      const cleanCode = code.trim().toUpperCase();
      if (!cleanCode) {
        return { valid: false, message: 'Invite code is required' };
      }

      const currentProfile = await usersRepository.getCurrentProfile();
      if (!currentProfile) {
        return { valid: false, message: 'Must be logged in to validate code' };
      }

      if (currentProfile.partnerId) {
        return { valid: false, message: 'You already have an active partner' };
      }

      const invitation = await invitationsRepository.getByCode(cleanCode);
      if (!invitation) {
        return { valid: false, message: 'Invalid or non-existent invite code' };
      }

      if (invitation.senderId === currentProfile.id) {
        return { valid: false, message: 'You cannot accept your own invite code', invitation };
      }

      if (invitation.status === 'accepted') {
        return { valid: false, message: 'This invitation code has already been accepted', invitation };
      }

      if (invitation.status === 'cancelled') {
        return { valid: false, message: 'This invitation has been cancelled by the sender', invitation };
      }

      if (invitation.status === 'declined') {
        return { valid: false, message: 'This invitation was previously declined', invitation };
      }

      const isExpired = new Date(invitation.expiresAt).getTime() < Date.now();
      if (invitation.status === 'expired' || isExpired) {
        if (invitation.status !== 'expired') {
          await invitationsRepository.updateStatus(invitation.id, 'expired');
        }
        return { valid: false, message: 'This invitation code has expired', invitation };
      }

      const senderProfile = await usersRepository.getById(invitation.senderId);

      return {
        valid: true,
        invitation,
        senderProfile,
      };
    } catch (err) {
      console.error('[CoupleService] validateInvite error:', err);
      return { valid: false, message: (err as Error).message || 'Error validating invitation code' };
    }
  }

  /**
   * Accept an invitation atomically using RPC.
   */
  async acceptInvite(code: string, anniversary?: string): Promise<{ coupleId: string }> {
    try {
      const validation = await this.validateInvite(code);
      if (!validation.valid || !validation.invitation) {
        throw new Error(validation.message || 'Invalid invitation code');
      }

      const currentProfile = await usersRepository.getCurrentProfile();
      if (!currentProfile) throw new Error('User not authenticated');

      const invite = validation.invitation;

      // Primary approach: Call PostgreSQL RPC for single-transaction atomic execution
      const { data: rpcData, error: rpcError } = await supabase.rpc('accept_couple_invite', {
        p_invite_code: invite.inviteCode,
        p_anniversary: anniversary || new Date().toISOString().split('T')[0],
      });

      if (rpcError || !rpcData?.couple_id) {
        throw normalizeError(rpcError || new Error('Failed to accept invitation'));
      }

      // Create acceptance notification for sender (backup for DB RPC)
      try {
        await notificationRepository.create({
          recipientId: invite.senderId,
          senderId: currentProfile.id,
          type: 'invite',
          title: 'Invitation Accepted! 💕',
          body: `${currentProfile.displayName || 'Your partner'} accepted your couple invitation!`,
        });
      } catch (notifErr) {
        console.warn('[CoupleService] Client notification insert skipped:', notifErr);
      }

      return { coupleId: rpcData.couple_id };
    } catch (err) {
      console.error('[CoupleService] acceptInvite error:', err);
      throw normalizeError(err);
    }
  }

  /**
   * Decline a received invitation.
   */
  async declineInvite(invitationId: string): Promise<Invitation> {
    try {
      const currentProfile = await usersRepository.getCurrentProfile();
      if (!currentProfile) throw new Error('User not authenticated');

      const invitation = await invitationsRepository.updateStatus(invitationId, 'declined', currentProfile.id);

      // Notify sender (backup for DB trigger)
      try {
        await notificationRepository.create({
          recipientId: invitation.senderId,
          senderId: currentProfile.id,
          type: 'invite',
          title: 'Invitation Declined',
          body: `${currentProfile.displayName || 'User'} declined your couple invitation.`,
        });
      } catch (notifErr) {
        console.warn('[CoupleService] Client notification insert skipped:', notifErr);
      }

      return invitation;
    } catch (err) {
      console.error('[CoupleService] declineInvite error:', err);
      throw normalizeError(err);
    }
  }

  /**
   * Cancel a sent invitation.
   */
  async cancelInvite(invitationId: string): Promise<Invitation> {
    try {
      const currentProfile = await usersRepository.getCurrentProfile();
      if (!currentProfile) throw new Error('User not authenticated');

      return await invitationsRepository.cancelInvitation(invitationId);
    } catch (err) {
      console.error('[CoupleService] cancelInvite error:', err);
      throw normalizeError(err);
    }
  }

  /**
   * Leave current relationship atomically.
   */
  async leaveRelationship(): Promise<boolean> {
    try {
      const currentProfile = await usersRepository.getCurrentProfile();
      if (!currentProfile || !currentProfile.partnerId) {
        throw new Error('Not currently in a relationship');
      }

      const formerPartnerId = currentProfile.partnerId;

      const { data: rpcData, error: rpcError } = await supabase.rpc('leave_relationship');

      if (rpcError || rpcData?.status !== 'ended') {
        throw normalizeError(rpcError || new Error('Failed to leave relationship'));
      }

      // Send notification to former partner (backup for DB RPC)
      try {
        await notificationRepository.create({
          recipientId: formerPartnerId,
          senderId: currentProfile.id,
          type: 'system',
          title: 'Relationship Ended',
          body: `${currentProfile.displayName || 'Your partner'} has left the relationship.`,
        });
      } catch (notifErr) {
        console.warn('[CoupleService] Client notification insert skipped:', notifErr);
      }

      return true;
    } catch (err) {
      console.error('[CoupleService] leaveRelationship error:', err);
      throw normalizeError(err);
    }
  }

  /**
   * Fetch all pending sent and received invitations for current user.
   */
  async getPendingInvites(): Promise<PendingInvitesResult> {
    try {
      const currentProfile = await usersRepository.getCurrentProfile();
      if (!currentProfile) return { sent: [], received: [] };

      const sent = await invitationsRepository.getPendingBySender(currentProfile.id);
      const received = await invitationsRepository.getPendingForUser(currentProfile.email, currentProfile.id);

      return { sent, received };
    } catch (err) {
      console.error('[CoupleService] getPendingInvites error:', err);
      throw normalizeError(err);
    }
  }
}

export const coupleService = new CoupleService();
