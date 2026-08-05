import { supabase } from '../supabase/client';
import { normalizeError } from '../errors';
import type { StatusUpdate } from '../../types/status';
import type { Database } from '../../types/database';

type StatusRow = Database['public']['Tables']['statuses']['Row'];

export interface IStatusRepository {
  getLatestStatus(userId: string): Promise<StatusUpdate | null>;
  createStatus(status: Omit<StatusUpdate, 'id' | 'updatedAt'> & { coupleId?: string; emoji?: string }): Promise<StatusUpdate>;
  updateStatus(id: string, updates: Partial<StatusUpdate>): Promise<StatusUpdate>;
  deleteStatus(id: string): Promise<boolean>;
}

export class StatusRepository implements IStatusRepository {
  private mapRow(row: StatusRow): StatusUpdate {
    return {
      id: row.id,
      userId: row.user_id,
      mood: row.emoji,
      statusMessage: row.status_text,
      customStatus: row.status_text,
      updatedAt: row.updated_at,
    };
  }

  async getLatestStatus(userId: string): Promise<StatusUpdate | null> {
    try {
      const { data, error } = await supabase
        .from('statuses')
        .select('*')
        .eq('user_id', userId)
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

  async createStatus(status: Omit<StatusUpdate, 'id' | 'updatedAt'> & { coupleId?: string; emoji?: string }): Promise<StatusUpdate> {
    try {
      const payload: Database['public']['Tables']['statuses']['Insert'] = {
        user_id: status.userId,
        couple_id: status.coupleId || null,
        status_text: status.statusMessage || status.customStatus || '',
        emoji: status.mood || status.emoji || '💬',
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
}

export const statusRepository = new StatusRepository();
