import { supabase } from '../supabase/client';
import { normalizeError } from '../errors';
import type { Database } from '../../types/database';

type InvitationRow = Database['public']['Tables']['invitations']['Row'];

export interface Invitation {
  id: string;
  inviteCode: string;
  email: string;
  senderId: string;
  receiverId?: string | null;
  coupleId?: string | null;
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'cancelled';
  expiresAt: string;
  acceptedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IInvitationsRepository {
  getByCode(code: string): Promise<Invitation | null>;
  getByEmail(email: string): Promise<Invitation[]>;
  getPendingBySender(senderId: string): Promise<Invitation[]>;
  getPendingForUser(email: string, userId: string): Promise<Invitation[]>;
  create(invitation: { inviteCode: string; email: string; senderId: string; coupleId?: string; expiresAt: string }): Promise<Invitation>;
  updateStatus(id: string, status: Invitation['status'], receiverId?: string): Promise<Invitation>;
  cancelInvitation(id: string): Promise<Invitation>;
}

export class InvitationsRepository implements IInvitationsRepository {
  private mapRow(row: InvitationRow): Invitation {
    return {
      id: row.id,
      inviteCode: row.invite_code,
      email: row.email,
      senderId: row.sender_id,
      receiverId: row.receiver_id,
      coupleId: row.couple_id,
      status: row.status as Invitation['status'],
      expiresAt: row.expires_at,
      acceptedAt: row.accepted_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async getByCode(code: string): Promise<Invitation | null> {
    try {
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('invite_code', code.trim().toUpperCase())
        .maybeSingle();

      if (error) throw normalizeError(error);
      if (!data) return null;
      return this.mapRow(data);
    } catch (err) {
      console.error('[InvitationsRepository] getByCode error:', err);
      return null;
    }
  }

  async getByEmail(email: string): Promise<Invitation[]> {
    try {
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('email', email.trim().toLowerCase())
        .order('created_at', { ascending: false });

      if (error) throw normalizeError(error);
      return (data || []).map((row) => this.mapRow(row));
    } catch (err) {
      console.error('[InvitationsRepository] getByEmail error:', err);
      return [];
    }
  }

  async getPendingBySender(senderId: string): Promise<Invitation[]> {
    try {
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('sender_id', senderId)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw normalizeError(error);
      return (data || []).map((row) => this.mapRow(row));
    } catch (err) {
      console.error('[InvitationsRepository] getPendingBySender error:', err);
      return [];
    }
  }

  async getPendingForUser(email: string, userId: string): Promise<Invitation[]> {
    try {
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .or(`email.eq.${email.trim().toLowerCase()},receiver_id.eq.${userId}`)
        .eq('status', 'pending')
        .neq('sender_id', userId)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw normalizeError(error);
      return (data || []).map((row) => this.mapRow(row));
    } catch (err) {
      console.error('[InvitationsRepository] getPendingForUser error:', err);
      return [];
    }
  }

  async create(invitation: { inviteCode: string; email: string; senderId: string; coupleId?: string; expiresAt: string }): Promise<Invitation> {
    try {
      const payload: Database['public']['Tables']['invitations']['Insert'] = {
        invite_code: invitation.inviteCode.trim().toUpperCase(),
        email: invitation.email.trim().toLowerCase(),
        sender_id: invitation.senderId,
        couple_id: invitation.coupleId || null,
        expires_at: invitation.expiresAt,
        status: 'pending',
      };

      const { data, error } = await supabase
        .from('invitations')
        .insert(payload)
        .select()
        .single();

      if (error) throw normalizeError(error);
      return this.mapRow(data);
    } catch (err) {
      console.error('[InvitationsRepository] create error:', err);
      throw normalizeError(err);
    }
  }

  async updateStatus(id: string, status: Invitation['status'], receiverId?: string): Promise<Invitation> {
    try {
      const payload: Database['public']['Tables']['invitations']['Update'] = {
        status,
        ...(receiverId ? { receiver_id: receiverId } : {}),
        ...(status === 'accepted' ? { accepted_at: new Date().toISOString() } : {}),
      };

      const { data, error } = await supabase
        .from('invitations')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw normalizeError(error);
      return this.mapRow(data);
    } catch (err) {
      console.error('[InvitationsRepository] updateStatus error:', err);
      throw normalizeError(err);
    }
  }

  async cancelInvitation(id: string): Promise<Invitation> {
    return this.updateStatus(id, 'cancelled');
  }
}

export const invitationsRepository = new InvitationsRepository();
