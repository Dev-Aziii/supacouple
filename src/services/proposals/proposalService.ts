import { toast } from 'sonner';
import { proposalRepository } from '../repositories/proposalRepository';
import { plansRepository } from '../repositories/plansRepository';
import { notificationRepository } from '../repositories/notificationRepository';
import { storageService } from '../storage/storageService';
import { activityService } from '../activity/activityService';
import type {
  SpontaneousProposal,
  CreateProposalDTO,
  UpdateProposalDTO,
  CounterProposalDTO,
  ProposalComment,
  ProposalReaction,
} from '../../types/proposal';
import type { PlanItem } from '../../types/plan';

const OFFLINE_PROPOSALS_QUEUE_KEY = 'supacouple_offline_proposals_queue';

export interface OfflineProposalAction {
  id: string;
  type: 'create' | 'update' | 'delete' | 'accept' | 'decline' | 'maybe' | 'counter' | 'complete';
  payload: unknown;
  partnerId?: string | null;
  timestamp: number;
}

export class ProposalService {
  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.processOfflineQueue().catch((err) =>
          console.error('[ProposalService] Auto-flushing offline proposals failed:', err)
        );
      });
    }
  }

  // --- Proposal Lifecycle Methods ---

  async createProposal(dto: CreateProposalDTO, partnerId?: string | null): Promise<SpontaneousProposal> {
    if (!navigator.onLine) {
      const fakeProposal: SpontaneousProposal = {
        id: `offline-${Date.now()}`,
        coupleId: dto.coupleId,
        senderId: dto.senderId,
        title: dto.title,
        description: dto.description,
        location: dto.location,
        latitude: dto.latitude,
        longitude: dto.longitude,
        coverImage: dto.coverImage,
        proposedTime: dto.proposedTime,
        endDatetime: dto.endDatetime,
        status: 'pending',
        visibility: 'couple',
        category: dto.category || 'date',
        estimatedCost: dto.estimatedCost,
        dressCode: dto.dressCode,
        weatherRequired: dto.weatherRequired,
        isSurprise: dto.isSurprise ?? false,
        autoAddToCalendar: dto.autoAddToCalendar ?? true,
        reminderMinutes: dto.reminderMinutes,
        priority: dto.priority || 'medium',
        parentProposalId: dto.parentProposalId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.enqueueOfflineAction({
        id: fakeProposal.id,
        type: 'create',
        payload: dto,
        partnerId,
        timestamp: Date.now(),
      });

      return fakeProposal;
    }

    const created = await proposalRepository.create(dto);

    try {
      await activityService.createActivity({
        coupleId: dto.coupleId,
        userId: dto.senderId,
        type: 'proposal_created',
        title: `created proposal "${created.title}"`,
        description: created.description || undefined,
        metadata: { proposal_id: created.id, planned_date: created.proposedTime },
      });
    } catch (err) {
      console.warn('[ProposalService] Activity fallback warning:', err);
    }

    if (partnerId) {
      try {
        await notificationRepository.create({
          recipientId: partnerId,
          senderId: dto.senderId,
          type: 'proposal',
          title: dto.parentProposalId ? 'Counter Proposal Received! 💡' : 'New Date Proposal Received! 💌',
          body: dto.parentProposalId
            ? `Partner counter-proposed: "${created.title}"`
            : `Partner proposed: "${created.title}"`,
        });
      } catch (err) {
        console.warn('[ProposalService] Partner notification creation failed:', err);
      }
    }

    return created;
  }

  async editProposal(id: string, updates: UpdateProposalDTO, partnerId?: string | null, userId?: string): Promise<SpontaneousProposal> {
    const existing = await proposalRepository.getById(id);
    if (existing && existing.status !== 'pending' && updates.status !== 'cancelled') {
      const msg = `Cannot edit a proposal with status "${existing.status}"`;
      toast.error(msg);
      throw new Error(msg);
    }

    if (!navigator.onLine) {
      this.enqueueOfflineAction({
        id,
        type: 'update',
        payload: { id, updates },
        partnerId,
        timestamp: Date.now(),
      });
      return {
        ...(existing || {
          id,
          coupleId: '',
          senderId: userId || '',
          title: '',
          proposedTime: new Date().toISOString(),
          status: 'pending',
          visibility: 'couple',
          category: 'date',
          isSurprise: false,
          autoAddToCalendar: true,
          priority: 'medium',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
        ...updates,
        updatedAt: new Date().toISOString(),
      };
    }

    const updated = await proposalRepository.update(id, updates);

    if (partnerId && userId) {
      try {
        await notificationRepository.create({
          recipientId: partnerId,
          senderId: userId,
          type: 'proposal',
          title: 'Proposal Updated',
          body: `Partner updated the proposal: "${updated.title}"`,
        });
      } catch (err) {
        console.warn('[ProposalService] Edit notification failed:', err);
      }
    }

    return updated;
  }

  async deleteProposal(id: string, partnerId?: string | null, userId?: string): Promise<boolean> {
    const existing = await proposalRepository.getById(id);

    if (!navigator.onLine) {
      this.enqueueOfflineAction({
        id,
        type: 'delete',
        payload: { id },
        partnerId,
        timestamp: Date.now(),
      });
      return true;
    }

    const success = await proposalRepository.delete(id);

    if (success && partnerId && userId) {
      try {
        await notificationRepository.create({
          recipientId: partnerId,
          senderId: userId,
          type: 'proposal',
          title: 'Proposal Cancelled',
          body: `Partner cancelled proposal: "${existing?.title || 'Proposal'}"`,
        });
      } catch (err) {
        console.warn('[ProposalService] Delete notification failed:', err);
      }
    }

    return success;
  }

  async acceptProposal(id: string, responseNote?: string, partnerId?: string | null, userId?: string): Promise<SpontaneousProposal> {
    const existing = await proposalRepository.getById(id);
    if (existing) {
      if (userId && existing.senderId === userId) {
        const msg = 'You cannot accept your own proposal';
        toast.error(msg);
        throw new Error(msg);
      }
      if (existing.status !== 'pending') {
        const msg = 'Proposal has already been responded to';
        toast.error(msg);
        throw new Error(msg);
      }
    }

    if (!navigator.onLine) {
      this.enqueueOfflineAction({
        id,
        type: 'accept',
        payload: { id, responseNote },
        partnerId,
        timestamp: Date.now(),
      });
    }

    const accepted = await proposalRepository.accept(id, responseNote);

    // Auto add to calendar if requested
    if (accepted.autoAddToCalendar) {
      try {
        await this.convertToPlan(accepted);
      } catch (err) {
        console.warn('[ProposalService] Auto convert to plan failed:', err);
      }
    }

    if (partnerId && userId) {
      try {
        await notificationRepository.create({
          recipientId: partnerId,
          senderId: userId,
          type: 'proposal',
          title: 'Proposal Accepted! 🎉',
          body: `Partner accepted your proposal: "${accepted.title}"! ${responseNote ? `Note: ${responseNote}` : ''}`,
        });
      } catch (err) {
        console.warn('[ProposalService] Accept notification failed:', err);
      }
    }

    return accepted;
  }

  async declineProposal(id: string, responseNote?: string, partnerId?: string | null, userId?: string): Promise<SpontaneousProposal> {
    const existing = await proposalRepository.getById(id);
    if (existing) {
      if (userId && existing.senderId === userId) {
        const msg = 'You cannot reject your own proposal';
        toast.error(msg);
        throw new Error(msg);
      }
      if (existing.status !== 'pending') {
        const msg = 'Proposal has already been responded to';
        toast.error(msg);
        throw new Error(msg);
      }
    }

    if (!navigator.onLine) {
      this.enqueueOfflineAction({
        id,
        type: 'decline',
        payload: { id, responseNote },
        partnerId,
        timestamp: Date.now(),
      });
    }

    const declined = await proposalRepository.decline(id, responseNote);

    if (partnerId && userId) {
      try {
        await notificationRepository.create({
          recipientId: partnerId,
          senderId: userId,
          type: 'proposal',
          title: 'Proposal Declined',
          body: `Partner declined proposal: "${declined.title}". ${responseNote ? `Note: ${responseNote}` : ''}`,
        });
      } catch (err) {
        console.warn('[ProposalService] Decline notification failed:', err);
      }
    }

    return declined;
  }

  async maybeProposal(id: string, responseNote?: string, partnerId?: string | null, userId?: string): Promise<SpontaneousProposal> {
    const existing = await proposalRepository.getById(id);
    if (existing) {
      if (userId && existing.senderId === userId) {
        const msg = 'You cannot respond to your own proposal';
        toast.error(msg);
        throw new Error(msg);
      }
      if (existing.status !== 'pending') {
        const msg = 'Proposal has already been responded to';
        toast.error(msg);
        throw new Error(msg);
      }
    }

    if (!navigator.onLine) {
      this.enqueueOfflineAction({
        id,
        type: 'maybe',
        payload: { id, responseNote },
        partnerId,
        timestamp: Date.now(),
      });
    }

    const maybe = await proposalRepository.maybe(id, responseNote);

    if (partnerId && userId) {
      try {
        await notificationRepository.create({
          recipientId: partnerId,
          senderId: userId,
          type: 'proposal',
          title: 'Proposal Marked Maybe 🤔',
          body: `Partner replied "Maybe" to proposal: "${maybe.title}". ${responseNote ? `Note: ${responseNote}` : ''}`,
        });
      } catch (err) {
        console.warn('[ProposalService] Maybe notification failed:', err);
      }
    }

    return maybe;
  }

  async counterProposal(dto: CounterProposalDTO, partnerId?: string | null): Promise<SpontaneousProposal> {
    // 1. Fetch original proposal
    const original = await proposalRepository.getById(dto.proposalId);
    if (!original) throw new Error('Original proposal not found');

    if (dto.senderId && original.senderId === dto.senderId) {
      const msg = 'You cannot counter your own proposal';
      toast.error(msg);
      throw new Error(msg);
    }

    if (original.status !== 'pending') {
      const msg = 'Proposal has already been responded to';
      toast.error(msg);
      throw new Error(msg);
    }

    // 2. Create child proposal with parentProposalId linked to original
    const newProposal = await this.createProposal(
      {
        coupleId: dto.coupleId,
        senderId: dto.senderId,
        title: dto.title || original.title,
        description: dto.description || original.description,
        location: dto.location || original.location,
        latitude: original.latitude,
        longitude: original.longitude,
        coverImage: original.coverImage,
        proposedTime: dto.proposedTime,
        endDatetime: dto.endDatetime || original.endDatetime,
        category: original.category,
        estimatedCost: original.estimatedCost,
        dressCode: original.dressCode,
        weatherRequired: original.weatherRequired,
        isSurprise: original.isSurprise,
        autoAddToCalendar: original.autoAddToCalendar,
        reminderMinutes: original.reminderMinutes,
        priority: original.priority,
        parentProposalId: original.id,
      },
      partnerId
    );

    // 3. Mark original proposal as countered
    await proposalRepository.counter(original.id, newProposal.id, dto.responseNote);

    return newProposal;
  }

  async cancelProposal(id: string, partnerId?: string | null, userId?: string): Promise<SpontaneousProposal> {
    return this.editProposal(id, { status: 'cancelled' }, partnerId, userId);
  }

  async completeProposal(id: string, partnerId?: string | null, userId?: string): Promise<SpontaneousProposal> {
    const completed = await proposalRepository.complete(id);

    if (partnerId && userId) {
      try {
        await notificationRepository.create({
          recipientId: partnerId,
          senderId: userId,
          type: 'proposal',
          title: 'Proposal Completed! ✨',
          body: `Partner marked proposal "${completed.title}" as completed!`,
        });
      } catch (err) {
        console.warn('[ProposalService] Complete notification failed:', err);
      }
    }

    return completed;
  }

  // --- Calendar Conversion ---

  async convertToPlan(proposal: SpontaneousProposal): Promise<PlanItem> {
    // End time default to 2 hours after start if not specified
    const startTime = new Date(proposal.proposedTime);
    const endTime = proposal.endDatetime
      ? new Date(proposal.endDatetime)
      : new Date(startTime.getTime() + 2 * 60 * 60 * 1000);

    const description = [
      proposal.description,
      proposal.dressCode ? `Dress Code: ${proposal.dressCode}` : null,
      proposal.estimatedCost ? `Estimated Cost: $${proposal.estimatedCost}` : null,
      proposal.weatherRequired ? `Weather: ${proposal.weatherRequired}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    return await plansRepository.create({
      coupleId: proposal.coupleId,
      createdBy: proposal.senderId,
      title: proposal.title,
      description: description || undefined,
      startAt: startTime.toISOString(),
      endAt: endTime.toISOString(),
      location: proposal.location,
      color: '#ec4899',
      priority: proposal.priority,
      category: proposal.category === 'dining'
        ? 'dinner'
        : proposal.category === 'getaway' || proposal.category === 'trip'
        ? 'trip'
        : proposal.category === 'movie'
        ? 'movie'
        : proposal.category === 'date'
        ? 'date'
        : 'custom',
      reminderMinutes: proposal.reminderMinutes,
      repeat: 'none',
      completed: false,
    });
  }

  // --- Image Upload ---

  async uploadProposalImage(file: File, userId: string): Promise<string> {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const filePath = `${userId}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

    const { path, error } = await storageService.uploadImage('proposal-images', filePath, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: true,
    });

    if (error || !path) {
      throw error || new Error('Image upload failed');
    }

    return storageService.getPublicUrl('proposal-images', path);
  }

  // --- Comments & Reactions ---

  async getComments(proposalId: string): Promise<ProposalComment[]> {
    return proposalRepository.getComments(proposalId);
  }

  async addComment(proposalId: string, userId: string, content: string, parentId?: string): Promise<ProposalComment> {
    return proposalRepository.addComment(proposalId, userId, content, parentId);
  }

  async updateComment(commentId: string, content: string): Promise<ProposalComment> {
    return proposalRepository.updateComment(commentId, content);
  }

  async deleteComment(commentId: string): Promise<boolean> {
    return proposalRepository.deleteComment(commentId);
  }

  async getReactions(proposalId: string): Promise<ProposalReaction[]> {
    return proposalRepository.getReactions(proposalId);
  }

  async toggleReaction(proposalId: string, userId: string, emoji: string): Promise<ProposalReaction[]> {
    return proposalRepository.toggleReaction(proposalId, userId, emoji);
  }

  // --- Offline Queue Handling ---

  private enqueueOfflineAction(action: OfflineProposalAction): void {
    try {
      const raw = localStorage.getItem(OFFLINE_PROPOSALS_QUEUE_KEY);
      const queue: OfflineProposalAction[] = raw ? JSON.parse(raw) : [];
      queue.push(action);
      localStorage.setItem(OFFLINE_PROPOSALS_QUEUE_KEY, JSON.stringify(queue));
    } catch (err) {
      console.error('[ProposalService] Failed to enqueue offline proposal action:', err);
    }
  }

  async processOfflineQueue(): Promise<void> {
    if (!navigator.onLine) return;
    try {
      const raw = localStorage.getItem(OFFLINE_PROPOSALS_QUEUE_KEY);
      if (!raw) return;
      const queue: OfflineProposalAction[] = JSON.parse(raw);
      if (!queue.length) return;

      localStorage.removeItem(OFFLINE_PROPOSALS_QUEUE_KEY);

      for (const action of queue) {
        const payload = action.payload as Record<string, unknown>;
        if (action.type === 'create') {
          await this.createProposal(payload as unknown as CreateProposalDTO, action.partnerId);
        } else if (action.type === 'update') {
          await this.editProposal(
            payload.id as string,
            payload.updates as UpdateProposalDTO,
            action.partnerId
          );
        } else if (action.type === 'delete') {
          await this.deleteProposal(payload.id as string, action.partnerId);
        } else if (action.type === 'accept') {
          await this.acceptProposal(
            payload.id as string,
            payload.responseNote as string,
            action.partnerId
          );
        } else if (action.type === 'decline') {
          await this.declineProposal(
            payload.id as string,
            payload.responseNote as string,
            action.partnerId
          );
        } else if (action.type === 'maybe') {
          await this.maybeProposal(
            payload.id as string,
            payload.responseNote as string,
            action.partnerId
          );
        }
      }
    } catch (err) {
      console.error('[ProposalService] Error flushing offline proposals queue:', err);
    }
  }
}

export const proposalService = new ProposalService();
