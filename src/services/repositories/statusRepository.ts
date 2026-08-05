import { supabase } from '../supabase/client';
import { normalizeError } from '../errors';
import type { StatusUpdate } from '../../types/status';
import type { Database } from '../../types/database';

type StatusRow = Database['public']['Tables']['statuses']['Row'];

export interface IStatusRepository {
  getLatestStatus(userId: string): Promise<StatusUpdate | null>;
  getPartnerStatus(partnerId: string): Promise<StatusUpdate | null>;
  getStatusHistory(userId: string, limit?: number): Promise<StatusUpdate[]>;
  getByCoupleId(coupleId: string, limit?: number): Promise<StatusUpdate[]>;
  createStatus(status: Omit<StatusUpdate, 'id' | 'updatedAt'> & { coupleId?: string; emoji?: string; expiresAt?: string | null }): Promise<StatusUpdate>;
  updateStatus(id: string, updates: Partial<StatusUpdate>): Promise<StatusUpdate>;
  deleteStatus(id: string): Promise<boolean>;
  expireStatus(id: string): Promise<boolean>;
}

export class StatusRepository implements IStatusRepository {
  private mapRow(row: StatusRow): StatusUpdate {
    return {
      id: row.id,
      userId: row.user_id,
      coupleId: row.couple_id,
      mood: row.emoji,
      statusMessage: row.status_text,
      customStatus: row.status_text,
      expiresAt: row.expires_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async getLatestStatus(userId: string): Promise<StatusUpdate | null> {
    try {
      const nowIso = new Date().toISOString();
      const { data, error } = await supabase
        .from('statuses')
        .select('*')
        .eq('user_id', userId)
        .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw normalizeError(error);
      if (!data) return null;
      return this.mapRow(data);
    } catch (err) {
      console.error('[StatusRepository] getLatestStatus error:', err);
      return null;
    }
  }

  async getPartnerStatus(partnerId: string): Promise<StatusUpdate | null> {
    return this.getLatestStatus(partnerId);
  }

  async getStatusHistory(userId: string, limit = 30): Promise<StatusUpdate[]> {
    try {
      const { data, error } = await supabase
        .from('statuses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw normalizeError(error);
      return (data || []).map((row) => this.mapRow(row));
    } catch (err) {
      console.error('[StatusRepository] getStatusHistory error:', err);
      return [];
    }
  }

  async getByCoupleId(coupleId: string, limit = 50): Promise<StatusUpdate[]> {
    try {
      const { data, error } = await supabase
        .from('statuses')
        .select('*')
        .eq('couple_id', coupleId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw normalizeError(error);
      return (data || []).map((row) => this.mapRow(row));
    } catch (err) {
      console.error('[StatusRepository] getByCoupleId error:', err);
      return [];
    }
  }

  async createStatus(status: Omit<StatusUpdate, 'id' | 'updatedAt'> & { coupleId?: string; emoji?: string; expiresAt?: string | null }): Promise<StatusUpdate> {
    try {
      const payload: Database['public']['Tables']['statuses']['Insert'] = {
        user_id: status.userId,
        couple_id: status.coupleId || null,
        status_text: status.statusMessage || status.customStatus || '',
        emoji: status.mood || status.emoji || '💬',
        expires_at: status.expiresAt || null,
        visibility: 'couple',
      };

      const { data, error } = await supabase
        .from('statuses')
        .insert(payload)
        .select()
        .single();

      if (error) throw normalizeError(error);
      return this.mapRow(data);
    } catch (err) {
      console.error('[StatusRepository] createStatus error:', err);
      throw normalizeError(err);
    }
  }

  async updateStatus(id: string, updates: Partial<StatusUpdate>): Promise<StatusUpdate> {
    try {
      const payload: Database['public']['Tables']['statuses']['Update'] = {};
      if (updates.statusMessage !== undefined && updates.statusMessage !== null) {
        payload.status_text = updates.statusMessage;
      }
      if (updates.mood !== undefined && updates.mood !== null) {
        payload.emoji = updates.mood;
      }
      if (updates.expiresAt !== undefined) {
        payload.expires_at = updates.expiresAt;
      }

      const { data, error } = await supabase
        .from('statuses')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw normalizeError(error);
      return this.mapRow(data);
    } catch (err) {
      console.error('[StatusRepository] updateStatus error:', err);
      throw normalizeError(err);
    }
  }

  async deleteStatus(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('statuses').delete().eq('id', id);
      if (error) throw normalizeError(error);
      return true;
    } catch (err) {
      console.error('[StatusRepository] deleteStatus error:', err);
      return false;
    }
  }

  async expireStatus(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('statuses')
        .update({ expires_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw normalizeError(error);
      return true;
    } catch (err) {
      console.error('[StatusRepository] expireStatus error:', err);
      return false;
    }
  }
}

export const statusRepository = new StatusRepository();

