import { supabase } from '../supabase/client';
import { normalizeError } from '../errors';
import type { MemoryItem } from '../../types/memory';
import type { Database } from '../../types/database';

type MemoryRow = Database['public']['Tables']['memories']['Row'];

export interface IMemoryRepository {
  getAll(): Promise<MemoryItem[]>;
  getByCoupleId(coupleId: string): Promise<MemoryItem[]>;
  getById(id: string): Promise<MemoryItem | null>;
  create(memory: Omit<MemoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<MemoryItem>;
  update(id: string, updates: Partial<MemoryItem>): Promise<MemoryItem>;
  delete(id: string): Promise<boolean>;
}

export class MemoryRepository implements IMemoryRepository {
  private mapRow(row: MemoryRow): MemoryItem {
    return {
      id: row.id,
      coupleId: row.couple_id,
      title: row.title,
      description: row.caption || undefined,
      mediaUrls: row.image_url ? [row.image_url] : [],
      eventDate: row.memory_date,
      createdBy: row.uploaded_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async getAll(): Promise<MemoryItem[]> {
    try {
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .order('memory_date', { ascending: false });

      if (error) throw normalizeError(error);
      return (data || []).map((row) => this.mapRow(row));
    } catch (err) {
      console.error('[MemoryRepository] getAll error:', err);
      return [];
    }
  }

  async getByCoupleId(coupleId: string): Promise<MemoryItem[]> {
    try {
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .eq('couple_id', coupleId)
        .order('memory_date', { ascending: false });

      if (error) throw normalizeError(error);
      return (data || []).map((row) => this.mapRow(row));
    } catch (err) {
      console.error('[MemoryRepository] getByCoupleId error:', err);
      return [];
    }
  }

  async getById(id: string): Promise<MemoryItem | null> {
    try {
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw normalizeError(error);
      if (!data) return null;
      return this.mapRow(data);
    } catch (err) {
      console.error('[MemoryRepository] getById error:', err);
      return null;
    }
  }

  async create(memory: Omit<MemoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<MemoryItem> {
    try {
      const payload: Database['public']['Tables']['memories']['Insert'] = {
        couple_id: memory.coupleId || '',
        uploaded_by: memory.createdBy,
        title: memory.title,
        caption: memory.description || null,
        image_url: memory.mediaUrls?.[0] || '',
        memory_date: memory.eventDate || new Date().toISOString().split('T')[0],
      };

      const { data, error } = await supabase
        .from('memories')
        .insert(payload)
        .select()
        .single();

      if (error) throw normalizeError(error);
      return this.mapRow(data);
    } catch (err) {
      console.error('[MemoryRepository] create error:', err);
      throw normalizeError(err);
    }
  }

  async update(id: string, updates: Partial<MemoryItem>): Promise<MemoryItem> {
    try {
      const payload: Database['public']['Tables']['memories']['Update'] = {};
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.description !== undefined) payload.caption = updates.description;
      if (updates.mediaUrls?.[0] !== undefined) payload.image_url = updates.mediaUrls[0];
      if (updates.eventDate !== undefined) payload.memory_date = updates.eventDate;

      const { data, error } = await supabase
        .from('memories')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw normalizeError(error);
      return this.mapRow(data);
    } catch (err) {
      console.error('[MemoryRepository] update error:', err);
      throw normalizeError(err);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('memories').delete().eq('id', id);
      if (error) throw normalizeError(error);
      return true;
    } catch (err) {
      console.error('[MemoryRepository] delete error:', err);
      return false;
    }
  }
}

export const memoryRepository = new MemoryRepository();
