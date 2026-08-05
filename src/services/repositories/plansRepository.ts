import { supabase } from '../supabase/client';
import { normalizeError } from '../errors';
import type { PlanItem, PlanCategory } from '../../types/plan';
import type { Database } from '../../types/database';

type PlanRow = Database['public']['Tables']['plans']['Row'];

export interface IPlansRepository {
  getAll(): Promise<PlanItem[]>;
  getByCoupleId(coupleId: string): Promise<PlanItem[]>;
  getById(id: string): Promise<PlanItem | null>;
  create(plan: Omit<PlanItem, 'id' | 'createdAt' | 'updatedAt'> & { coupleId?: string }): Promise<PlanItem>;
  update(id: string, updates: Partial<PlanItem>): Promise<PlanItem>;
  delete(id: string): Promise<boolean>;
}

export class PlansRepository implements IPlansRepository {
  private mapRow(row: PlanRow): PlanItem {
    return {
      id: row.id,
      title: row.title,
      description: row.description || undefined,
      category: (row.priority as PlanCategory) || 'activity',
      status: row.completed ? 'completed' : 'scheduled',
      scheduledDate: row.start_at,
      location: row.location || undefined,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async getAll(): Promise<PlanItem[]> {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('start_at', { ascending: true });

      if (error) throw normalizeError(error);
      return (data || []).map((row) => this.mapRow(row));
    } catch (err) {
      console.error('[PlansRepository] getAll error:', err);
      return [];
    }
  }

  async getByCoupleId(coupleId: string): Promise<PlanItem[]> {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('couple_id', coupleId)
        .order('start_at', { ascending: true });

      if (error) throw normalizeError(error);
      return (data || []).map((row) => this.mapRow(row));
    } catch (err) {
      console.error('[PlansRepository] getByCoupleId error:', err);
      return [];
    }
  }

  async getById(id: string): Promise<PlanItem | null> {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw normalizeError(error);
      if (!data) return null;
      return this.mapRow(data);
    } catch (err) {
      console.error('[PlansRepository] getById error:', err);
      return null;
    }
  }

  async create(plan: Omit<PlanItem, 'id' | 'createdAt' | 'updatedAt'> & { coupleId?: string }): Promise<PlanItem> {
    try {
      const payload: Database['public']['Tables']['plans']['Insert'] = {
        couple_id: plan.coupleId || '',
        created_by: plan.createdBy,
        title: plan.title,
        description: plan.description || null,
        start_at: plan.scheduledDate || new Date().toISOString(),
        end_at: plan.scheduledDate || new Date().toISOString(),
        location: plan.location || null,
        priority: 'medium',
        completed: plan.status === 'completed',
      };

      const { data, error } = await supabase
        .from('plans')
        .insert(payload)
        .select()
        .single();

      if (error) throw normalizeError(error);
      return this.mapRow(data);
    } catch (err) {
      console.error('[PlansRepository] create error:', err);
      throw normalizeError(err);
    }
  }

  async update(id: string, updates: Partial<PlanItem>): Promise<PlanItem> {
    try {
      const payload: Database['public']['Tables']['plans']['Update'] = {};
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.scheduledDate !== undefined) {
        payload.start_at = updates.scheduledDate;
        payload.end_at = updates.scheduledDate;
      }
      if (updates.location !== undefined) payload.location = updates.location;
      if (updates.status !== undefined) payload.completed = updates.status === 'completed';

      const { data, error } = await supabase
        .from('plans')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw normalizeError(error);
      return this.mapRow(data);
    } catch (err) {
      console.error('[PlansRepository] update error:', err);
      throw normalizeError(err);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('plans').delete().eq('id', id);
      if (error) throw normalizeError(error);
      return true;
    } catch (err) {
      console.error('[PlansRepository] delete error:', err);
      return false;
    }
  }
}

export const plansRepository = new PlansRepository();
