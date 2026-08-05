import { supabase } from '../supabase/client';
import { normalizeError } from '../errors';
import type { SpontaneousProposal, ProposalStatus } from '../../types/proposal';
import type { Database } from '../../types/database';

type ProposalRow = Database['public']['Tables']['proposals']['Row'];

export interface IProposalRepository {
  getAll(): Promise<SpontaneousProposal[]>;
  getByCoupleId(coupleId: string): Promise<SpontaneousProposal[]>;
  getById(id: string): Promise<SpontaneousProposal | null>;
  create(proposal: Omit<SpontaneousProposal, 'id' | 'createdAt'> & { coupleId?: string }): Promise<SpontaneousProposal>;
  update(id: string, updates: Partial<SpontaneousProposal>): Promise<SpontaneousProposal>;
  delete(id: string): Promise<boolean>;
}

export class ProposalRepository implements IProposalRepository {
  private mapRow(row: ProposalRow): SpontaneousProposal {
    return {
      id: row.id,
      senderId: row.created_by,
      receiverId: '',
      title: row.title,
      description: row.description || undefined,
      proposedTime: row.planned_date,
      status: row.status as ProposalStatus,
      responseNote: row.response_message || undefined,
      createdAt: row.created_at,
      expiresAt: row.planned_date,
    };
  }

  async getAll(): Promise<SpontaneousProposal[]> {
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw normalizeError(error);
      return (data || []).map((row) => this.mapRow(row));
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
      return (data || []).map((row) => this.mapRow(row));
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
      return this.mapRow(data);
    } catch (err) {
      console.error('[ProposalRepository] getById error:', err);
      return null;
    }
  }

  async create(proposal: Omit<SpontaneousProposal, 'id' | 'createdAt'> & { coupleId?: string }): Promise<SpontaneousProposal> {
    try {
      const payload: Database['public']['Tables']['proposals']['Insert'] = {
        couple_id: proposal.coupleId || '',
        created_by: proposal.senderId,
        title: proposal.title,
        description: proposal.description || null,
        planned_date: proposal.proposedTime || proposal.expiresAt || new Date().toISOString(),
        status: proposal.status || 'pending',
        response_message: proposal.responseNote || null,
      };

      const { data, error } = await supabase
        .from('proposals')
        .insert(payload)
        .select()
        .single();

      if (error) throw normalizeError(error);
      return this.mapRow(data);
    } catch (err) {
      console.error('[ProposalRepository] create error:', err);
      throw normalizeError(err);
    }
  }

  async update(id: string, updates: Partial<SpontaneousProposal>): Promise<SpontaneousProposal> {
    try {
      const payload: Database['public']['Tables']['proposals']['Update'] = {};
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.responseNote !== undefined) payload.response_message = updates.responseNote;

      const { data, error } = await supabase
        .from('proposals')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw normalizeError(error);
      return this.mapRow(data);
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
}

export const proposalRepository = new ProposalRepository();
