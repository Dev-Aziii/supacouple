import { supabase } from '../supabase/client';
import { normalizeError } from '../errors';
import type { Database } from '../../types/database';

type CoupleRow = Database['public']['Tables']['couples']['Row'];

export interface Couple {
  id: string;
  relationshipName: string;
  anniversary?: string | null;
  status: 'pending' | 'active' | 'ended' | 'paused';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICouplesRepository {
  getById(id: string): Promise<Couple | null>;
  getByUserId(userId: string): Promise<Couple | null>;
  getActiveCoupleForUser(userId: string, partnerId?: string | null): Promise<Couple | null>;
  create(couple: { relationshipName: string; anniversary?: string; createdBy: string }): Promise<Couple>;
  update(id: string, updates: Partial<Couple>): Promise<Couple>;
}

export class CouplesRepository implements ICouplesRepository {
  private mapRow(row: CoupleRow): Couple {
    return {
      id: row.id,
      relationshipName: row.relationship_name,
      anniversary: row.anniversary,
      status: row.status as Couple['status'],
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async getById(id: string): Promise<Couple | null> {
    try {
      const { data, error } = await supabase
        .from('couples')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw normalizeError(error);
      if (!data) return null;
      return this.mapRow(data);
    } catch (err) {
      console.error('[CouplesRepository] getById error:', err);
      return null;
    }
  }

  async getByUserId(userId: string): Promise<Couple | null> {
    try {
      const { data, error } = await supabase
        .from('couples')
        .select('*')
        .eq('created_by', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw normalizeError(error);
      if (!data) return null;
      return this.mapRow(data);
    } catch (err) {
      console.error('[CouplesRepository] getByUserId error:', err);
      return null;
    }
  }

  async getActiveCoupleForUser(userId: string, partnerId?: string | null): Promise<Couple | null> {
    try {
      const userIds = [userId];
      if (partnerId) userIds.push(partnerId);

      const { data, error } = await supabase
        .from('couples')
        .select('*')
        .in('created_by', userIds)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw normalizeError(error);
      if (!data) return null;
      return this.mapRow(data);
    } catch (err) {
      console.error('[CouplesRepository] getActiveCoupleForUser error:', err);
      return null;
    }
  }

  async create(couple: { relationshipName: string; anniversary?: string; createdBy: string }): Promise<Couple> {
    try {
      const payload: Database['public']['Tables']['couples']['Insert'] = {
        relationship_name: couple.relationshipName,
        anniversary: couple.anniversary || null,
        created_by: couple.createdBy,
        status: 'active',
      };

      const { data, error } = await supabase
        .from('couples')
        .insert(payload)
        .select()
        .single();

      if (error) throw normalizeError(error);
      return this.mapRow(data);
    } catch (err) {
      console.error('[CouplesRepository] create error:', err);
      throw normalizeError(err);
    }
  }

  async update(id: string, updates: Partial<Couple>): Promise<Couple> {
    try {
      const payload: Database['public']['Tables']['couples']['Update'] = {};
      if (updates.relationshipName !== undefined) payload.relationship_name = updates.relationshipName;
      if (updates.anniversary !== undefined) payload.anniversary = updates.anniversary;
      if (updates.status !== undefined) payload.status = updates.status;

      const { data, error } = await supabase
        .from('couples')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw normalizeError(error);
      return this.mapRow(data);
    } catch (err) {
      console.error('[CouplesRepository] update error:', err);
      throw normalizeError(err);
    }
  }
}

export const couplesRepository = new CouplesRepository();
