import { supabase } from '../supabase/client';
import { normalizeError } from '../errors';
import type {
  SpontaneousProposal,
  ProposalStatus,
  ProposalCategory,
  ProposalPriority,
  CreateProposalDTO,
  UpdateProposalDTO,
  ProposalComment,
  ProposalReaction,
} from '../../types/proposal';
import type { Database } from '../../types/database';


export interface IProposalRepository {
  getAll(): Promise<SpontaneousProposal[]>;
  getByCoupleId(coupleId: string): Promise<SpontaneousProposal[]>;
  getById(id: string): Promise<SpontaneousProposal | null>;
  getHistory(proposalId: string): Promise<SpontaneousProposal[]>;
  getUpcoming(coupleId: string): Promise<SpontaneousProposal[]>;
  getPartnerPending(coupleId: string, currentUserId: string): Promise<SpontaneousProposal[]>;
  create(dto: CreateProposalDTO): Promise<SpontaneousProposal>;
  update(id: string, updates: UpdateProposalDTO): Promise<SpontaneousProposal>;
  delete(id: string): Promise<boolean>;
  accept(id: string, responseNote?: string): Promise<SpontaneousProposal>;
  decline(id: string, responseNote?: string): Promise<SpontaneousProposal>;
  maybe(id: string, responseNote?: string): Promise<SpontaneousProposal>;
  counter(id: string, newProposalId: string, responseNote?: string): Promise<SpontaneousProposal>;
  complete(id: string): Promise<SpontaneousProposal>;
  // Comments
  getComments(proposalId: string): Promise<ProposalComment[]>;
  addComment(proposalId: string, userId: string, content: string, parentId?: string): Promise<ProposalComment>;
  updateComment(commentId: string, content: string): Promise<ProposalComment>;
  deleteComment(commentId: string): Promise<boolean>;
  // Reactions
  getReactions(proposalId: string): Promise<ProposalReaction[]>;
  toggleReaction(proposalId: string, userId: string, emoji: string): Promise<ProposalReaction[]>;
}

export class ProposalRepository implements IProposalRepository {
  private mapRow(row: Record<string, unknown>): SpontaneousProposal {
    return {
      id: row.id as string,
      coupleId: (row.couple_id as string) || '',
      senderId: (row.created_by as string) || '',
      title: (row.title as string) || '',
      description: (row.description as string) || undefined,
      location: (row.location as string) || undefined,
      latitude: row.latitude ? Number(row.latitude) : undefined,
      longitude: row.longitude ? Number(row.longitude) : undefined,
      coverImage: (row.cover_image as string) || undefined,
      proposedTime: (row.start_datetime as string) || (row.planned_date as string) || new Date().toISOString(),
      endDatetime: (row.end_datetime as string) || undefined,
      status: (row.status as ProposalStatus) || 'pending',
      acceptedAt: (row.accepted_at as string) || undefined,
      declinedAt: (row.declined_at as string) || undefined,
      respondedAt: (row.responded_at as string) || undefined,
      responseNote: (row.response_message as string) || undefined,
      parentProposalId: (row.parent_proposal_id as string) || undefined,
      visibility: (row.visibility as 'couple' | 'private') || 'couple',
      category: (row.category as ProposalCategory) || 'date',
      estimatedCost: row.estimated_cost ? Number(row.estimated_cost) : undefined,
      dressCode: (row.dress_code as string) || undefined,
      weatherRequired: (row.weather_required as string) || undefined,
      isSurprise: Boolean(row.is_surprise),
      autoAddToCalendar: row.auto_add_to_calendar !== false,
      reminderMinutes: row.reminder_minutes ? Number(row.reminder_minutes) : undefined,
      priority: (row.priority as ProposalPriority) || 'medium',
      createdAt: (row.created_at as string) || new Date().toISOString(),
      updatedAt: (row.updated_at as string) || new Date().toISOString(),
      expiresAt: (row.start_datetime as string) || (row.planned_date as string) || undefined,
    };
  }

  async getAll(): Promise<SpontaneousProposal[]> {
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw normalizeError(error);
      return (data || []).map((row) => this.mapRow(row as Record<string, unknown>));
    } catch (err) {
      console.error('[ProposalRepository] getAll error:', err);
      return [];
    }
  }

  async getByCoupleId(coupleId: string): Promise<SpontaneousProposal[]> {
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('couple_id', coupleId)
        .order('created_at', { ascending: false });

      if (error) throw normalizeError(error);
      return (data || []).map((row) => this.mapRow(row as Record<string, unknown>));
    } catch (err) {
      console.error('[ProposalRepository] getByCoupleId error:', err);
      return [];
    }
  }

  async getById(id: string): Promise<SpontaneousProposal | null> {
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw normalizeError(error);
      if (!data) return null;
      return this.mapRow(data as Record<string, unknown>);
    } catch (err) {
      console.error('[ProposalRepository] getById error:', err);
      return null;
    }
  }

  async getHistory(proposalId: string): Promise<SpontaneousProposal[]> {
    try {
      // Fetch ancestors and descendants linked by parent_proposal_id
      const current = await this.getById(proposalId);
      if (!current) return [];

      let rootId = current.id;
      let temp = current;
      while (temp.parentProposalId) {
        const parent = await this.getById(temp.parentProposalId);
        if (parent) {
          rootId = parent.id;
          temp = parent;
        } else {
          break;
        }
      }

      // Fetch all proposals in couple that belong to tree
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('couple_id', current.coupleId)
        .order('created_at', { ascending: true });

      if (error) throw normalizeError(error);
      const all = (data || []).map((row) => this.mapRow(row as Record<string, unknown>));

      const historyTree: SpontaneousProposal[] = [];
      const collect = (pid: string) => {
        const node = all.find((p) => p.id === pid);
        if (node) {
          historyTree.push(node);
          const children = all.filter((p) => p.parentProposalId === pid);
          children.forEach((c) => collect(c.id));
        }
      };

      collect(rootId);
      return historyTree;
    } catch (err) {
      console.error('[ProposalRepository] getHistory error:', err);
      return [];
    }
  }

  async getUpcoming(coupleId: string): Promise<SpontaneousProposal[]> {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('couple_id', coupleId)
        .in('status', ['accepted', 'pending'])
        .gte('start_datetime', now)
        .order('start_datetime', { ascending: true });

      if (error) throw normalizeError(error);
      return (data || []).map((row) => this.mapRow(row as Record<string, unknown>));
    } catch (err) {
      console.error('[ProposalRepository] getUpcoming error:', err);
      return [];
    }
  }

  async getPartnerPending(coupleId: string, currentUserId: string): Promise<SpontaneousProposal[]> {
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('couple_id', coupleId)
        .eq('status', 'pending')
        .neq('created_by', currentUserId)
        .order('created_at', { ascending: false });

      if (error) throw normalizeError(error);
      return (data || []).map((row) => this.mapRow(row as Record<string, unknown>));
    } catch (err) {
      console.error('[ProposalRepository] getPartnerPending error:', err);
      return [];
    }
  }

  async create(dto: CreateProposalDTO): Promise<SpontaneousProposal> {
    try {
      const payload = {
        couple_id: dto.coupleId,
        created_by: dto.senderId,
        title: dto.title,
        description: dto.description || null,
        location: dto.location || null,
        latitude: dto.latitude || null,
        longitude: dto.longitude || null,
        cover_image: dto.coverImage || null,
        planned_date: dto.proposedTime,
        start_datetime: dto.proposedTime,
        end_datetime: dto.endDatetime || null,
        status: 'pending',
        category: dto.category || 'date',
        estimated_cost: dto.estimatedCost || null,
        dress_code: dto.dressCode || null,
        weather_required: dto.weatherRequired || null,
        is_surprise: dto.isSurprise ?? false,
        auto_add_to_calendar: dto.autoAddToCalendar ?? true,
        reminder_minutes: dto.reminderMinutes || null,
        priority: dto.priority || 'medium',
        parent_proposal_id: dto.parentProposalId || null,
      };

      const { data, error } = await supabase
        .from('proposals')
        .insert(payload as unknown as Database['public']['Tables']['proposals']['Insert'])
        .select()
        .single();

      if (error) throw normalizeError(error);
      return this.mapRow(data as Record<string, unknown>);
    } catch (err) {
      console.error('[ProposalRepository] create error:', err);
      throw normalizeError(err);
    }
  }

  async update(id: string, updates: UpdateProposalDTO): Promise<SpontaneousProposal> {
    try {
      const payload: Database['public']['Tables']['proposals']['Update'] = {};
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.location !== undefined) payload.location = updates.location;
      if (updates.latitude !== undefined) payload.latitude = updates.latitude;
      if (updates.longitude !== undefined) payload.longitude = updates.longitude;
      if (updates.coverImage !== undefined) payload.cover_image = updates.coverImage;
      if (updates.proposedTime !== undefined) {
        payload.planned_date = updates.proposedTime;
        payload.start_datetime = updates.proposedTime;
      }
      if (updates.endDatetime !== undefined) payload.end_datetime = updates.endDatetime;
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.responseNote !== undefined) payload.response_message = updates.responseNote;
      if (updates.category !== undefined) payload.category = updates.category;
      if (updates.estimatedCost !== undefined) payload.estimated_cost = updates.estimatedCost;
      if (updates.dressCode !== undefined) payload.dress_code = updates.dressCode;
      if (updates.weatherRequired !== undefined) payload.weather_required = updates.weatherRequired;
      if (updates.isSurprise !== undefined) payload.is_surprise = updates.isSurprise;
      if (updates.autoAddToCalendar !== undefined) payload.auto_add_to_calendar = updates.autoAddToCalendar;
      if (updates.reminderMinutes !== undefined) payload.reminder_minutes = updates.reminderMinutes;
      if (updates.priority !== undefined) payload.priority = updates.priority;

      const { data, error } = await supabase
        .from('proposals')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw normalizeError(error);
      return this.mapRow(data as Record<string, unknown>);
    } catch (err) {
      console.error('[ProposalRepository] update error:', err);
      throw normalizeError(err);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('proposals').delete().eq('id', id);
      if (error) throw normalizeError(error);
      return true;
    } catch (err) {
      console.error('[ProposalRepository] delete error:', err);
      return false;
    }
  }

  async accept(id: string, responseNote?: string): Promise<SpontaneousProposal> {
    const now = new Date().toISOString();
    return this.update(id, {
      status: 'accepted',
      responseNote,
    }).then(async (prop) => {
      // set accepted_at and responded_at
      await supabase
        .from('proposals')
        .update({ accepted_at: now, responded_at: now })
        .eq('id', id);
      return { ...prop, acceptedAt: now, respondedAt: now, status: 'accepted', responseNote };
    });
  }

  async decline(id: string, responseNote?: string): Promise<SpontaneousProposal> {
    const now = new Date().toISOString();
    return this.update(id, {
      status: 'declined',
      responseNote,
    }).then(async (prop) => {
      await supabase
        .from('proposals')
        .update({ declined_at: now, responded_at: now })
        .eq('id', id);
      return { ...prop, declinedAt: now, respondedAt: now, status: 'declined', responseNote };
    });
  }

  async maybe(id: string, responseNote?: string): Promise<SpontaneousProposal> {
    const now = new Date().toISOString();
    return this.update(id, {
      status: 'maybe',
      responseNote,
    }).then(async (prop) => {
      await supabase
        .from('proposals')
        .update({ responded_at: now })
        .eq('id', id);
      return { ...prop, respondedAt: now, status: 'maybe', responseNote };
    });
  }

  async counter(id: string, _newProposalId: string, responseNote?: string): Promise<SpontaneousProposal> {
    const now = new Date().toISOString();
    // Update original proposal to countered
    const updatedOriginal = await this.update(id, {
      status: 'countered',
      responseNote,
    });
    await supabase.from('proposals').update({ responded_at: now }).eq('id', id);
    return updatedOriginal;
  }

  async complete(id: string): Promise<SpontaneousProposal> {
    return this.update(id, { status: 'completed' });
  }

  // --- Comments Implementation ---

  async getComments(proposalId: string): Promise<ProposalComment[]> {
    try {
      const { data, error } = await supabase
        .from('proposal_comments')
        .select('*')
        .eq('proposal_id', proposalId)
        .order('created_at', { ascending: true });

      if (error) throw normalizeError(error);
      return (data || []).map((row) => ({
        id: row.id,
        proposalId: row.proposal_id,
        userId: row.user_id,
        content: row.content,
        parentId: row.parent_id || undefined,
        isEdited: row.is_edited,
        isDeleted: row.is_deleted,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    } catch (err) {
      console.error('[ProposalRepository] getComments error:', err);
      return [];
    }
  }

  async addComment(proposalId: string, userId: string, content: string, parentId?: string): Promise<ProposalComment> {
    try {
      const { data, error } = await supabase
        .from('proposal_comments')
        .insert({
          proposal_id: proposalId,
          user_id: userId,
          content,
          parent_id: parentId || null,
        })
        .select()
        .single();

      if (error) throw normalizeError(error);
      return {
        id: data.id,
        proposalId: data.proposal_id,
        userId: data.user_id,
        content: data.content,
        parentId: data.parent_id || undefined,
        isEdited: data.is_edited,
        isDeleted: data.is_deleted,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (err) {
      console.error('[ProposalRepository] addComment error:', err);
      throw normalizeError(err);
    }
  }

  async updateComment(commentId: string, content: string): Promise<ProposalComment> {
    try {
      const { data, error } = await supabase
        .from('proposal_comments')
        .update({
          content,
          is_edited: true,
        })
        .eq('id', commentId)
        .select()
        .single();

      if (error) throw normalizeError(error);
      return {
        id: data.id,
        proposalId: data.proposal_id,
        userId: data.user_id,
        content: data.content,
        parentId: data.parent_id || undefined,
        isEdited: data.is_edited,
        isDeleted: data.is_deleted,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (err) {
      console.error('[ProposalRepository] updateComment error:', err);
      throw normalizeError(err);
    }
  }

  async deleteComment(commentId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('proposal_comments')
        .update({ content: '[Deleted comment]', is_deleted: true })
        .eq('id', commentId);

      if (error) throw normalizeError(error);
      return true;
    } catch (err) {
      console.error('[ProposalRepository] deleteComment error:', err);
      return false;
    }
  }

  // --- Reactions Implementation ---

  async getReactions(proposalId: string): Promise<ProposalReaction[]> {
    try {
      const { data, error } = await supabase
        .from('proposal_reactions')
        .select('*')
        .eq('proposal_id', proposalId);

      if (error) throw normalizeError(error);
      return (data || []).map((row) => ({
        id: row.id,
        proposalId: row.proposal_id,
        userId: row.user_id,
        emoji: row.emoji,
        createdAt: row.created_at,
      }));
    } catch (err) {
      console.error('[ProposalRepository] getReactions error:', err);
      return [];
    }
  }

  async toggleReaction(proposalId: string, userId: string, emoji: string): Promise<ProposalReaction[]> {
    try {
      // Check existing reaction for user on proposal
      const { data: existing } = await supabase
        .from('proposal_reactions')
        .select('*')
        .eq('proposal_id', proposalId)
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        if (existing.emoji === emoji) {
          // Remove reaction
          await supabase.from('proposal_reactions').delete().eq('id', existing.id);
        } else {
          // Replace emoji
          await supabase.from('proposal_reactions').update({ emoji }).eq('id', existing.id);
        }
      } else {
        // Insert new reaction
        await supabase.from('proposal_reactions').insert({
          proposal_id: proposalId,
          user_id: userId,
          emoji,
        });
      }

      return this.getReactions(proposalId);
    } catch (err) {
      console.error('[ProposalRepository] toggleReaction error:', err);
      throw normalizeError(err);
    }
  }
}

export const proposalRepository = new ProposalRepository();
