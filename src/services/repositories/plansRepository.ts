import { supabase } from '../supabase/client';
import { normalizeError } from '../errors';
import { activityService } from '../activity/activityService';
import type { PlanItem, PlanCategory, PlanPriority, PlanRepeat } from '../../types/plan';
import type { Database } from '../../types/database';

type PlanRow = Database['public']['Tables']['plans']['Row'];

export interface CreatePlanDTO {
  coupleId: string;
  createdBy: string;
  title: string;
  description?: string;
  category?: PlanCategory;
  priority?: PlanPriority;
  color?: string;
  startAt: string;
  endAt: string;
  location?: string;
  reminderMinutes?: number | null;
  repeat?: PlanRepeat;
  completed?: boolean;
}

export interface UpdatePlanDTO {
  title?: string;
  description?: string;
  category?: PlanCategory;
  priority?: PlanPriority;
  color?: string;
  startAt?: string;
  endAt?: string;
  location?: string;
  reminderMinutes?: number | null;
  repeat?: PlanRepeat;
  completed?: boolean;
}

export interface IPlansRepository {
  getAll(): Promise<PlanItem[]>;
  getByCoupleId(coupleId: string): Promise<PlanItem[]>;
  getByDateRange(coupleId: string, startIso: string, endIso: string): Promise<PlanItem[]>;
  getById(id: string): Promise<PlanItem | null>;
  create(dto: CreatePlanDTO): Promise<PlanItem>;
  update(id: string, updates: UpdatePlanDTO): Promise<PlanItem>;
  delete(id: string): Promise<boolean>;
}

export class PlansRepository implements IPlansRepository {
  private mapRow(row: PlanRow): PlanItem {
    return {
      id: row.id,
      coupleId: row.couple_id,
      createdBy: row.created_by,
      title: row.title,
      description: row.description || undefined,
      category: (row.category as PlanCategory) || 'custom',
      priority: (row.priority as PlanPriority) || 'medium',
      color: row.color || '#ec4899',
      completed: row.completed,
      status: row.completed ? 'completed' : 'scheduled',
      startAt: row.start_at,
      endAt: row.end_at,
      location: row.location || undefined,
      reminderMinutes: row.reminder_minutes ?? undefined,
      repeat: (row.repeat as PlanRepeat) || 'none',
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

  async getByDateRange(coupleId: string, startIso: string, endIso: string): Promise<PlanItem[]> {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('couple_id', coupleId)
        .or(`repeat.neq.none,and(start_at.gte.${startIso},start_at.lte.${endIso})`)
        .order('start_at', { ascending: true });

      if (error) throw normalizeError(error);
      return (data || []).map((row) => this.mapRow(row));
    } catch (err) {
      console.error('[PlansRepository] getByDateRange error:', err);
      return this.getByCoupleId(coupleId);
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

  async create(dto: CreatePlanDTO): Promise<PlanItem> {
    try {
      const payload: Database['public']['Tables']['plans']['Insert'] = {
        couple_id: dto.coupleId,
        created_by: dto.createdBy,
        title: dto.title,
        description: dto.description || null,
        category: dto.category || 'custom',
        priority: dto.priority || 'medium',
        color: dto.color || '#ec4899',
        start_at: dto.startAt,
        end_at: dto.endAt,
        location: dto.location || null,
        reminder_minutes: dto.reminderMinutes ?? null,
        repeat: dto.repeat || 'none',
        completed: dto.completed ?? false,
      };

      const { data, error } = await supabase
        .from('plans')
        .insert(payload)
        .select()
        .single();

      if (error) throw normalizeError(error);

      if (data && data.couple_id && data.created_by) {
        try {
          await activityService.createActivity({
            coupleId: data.couple_id,
            userId: data.created_by,
            type: 'plan_created',
            title: `created plan "${data.title}"`,
            description: data.description || undefined,
            metadata: { plan_id: data.id, start_at: data.start_at, location: data.location || undefined },
          });
        } catch (err) {
          console.warn('[PlansRepository] activity fallback warning:', err);
        }
      }

      return this.mapRow(data);
    } catch (err) {
      console.error('[PlansRepository] create error:', err);
      throw normalizeError(err);
    }
  }

  async update(id: string, updates: UpdatePlanDTO): Promise<PlanItem> {
    try {
      const payload: Database['public']['Tables']['plans']['Update'] = {};
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.description !== undefined) payload.description = updates.description || null;
      if (updates.category !== undefined) payload.category = updates.category;
      if (updates.priority !== undefined) payload.priority = updates.priority;
      if (updates.color !== undefined) payload.color = updates.color;
      if (updates.startAt !== undefined) payload.start_at = updates.startAt;
      if (updates.endAt !== undefined) payload.end_at = updates.endAt;
      if (updates.location !== undefined) payload.location = updates.location || null;
      if (updates.reminderMinutes !== undefined) payload.reminder_minutes = updates.reminderMinutes;
      if (updates.repeat !== undefined) payload.repeat = updates.repeat;
      if (updates.completed !== undefined) payload.completed = updates.completed;

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
