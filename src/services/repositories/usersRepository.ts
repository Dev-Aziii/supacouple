import { supabase } from '../supabase/client';
import { normalizeError } from '../errors';
import type { UserProfile } from '../../types/user';
import type { Database } from '../../types/database';

export interface IUsersRepository {
  getById(id: string): Promise<UserProfile | null>;
  getByEmail(email: string): Promise<UserProfile | null>;
  getCurrentProfile(): Promise<UserProfile | null>;
  createProfile(profile: Omit<UserProfile, 'createdAt' | 'updatedAt'>): Promise<UserProfile>;
  updateProfile(id: string, updates: Partial<UserProfile>): Promise<UserProfile>;
  deleteProfile(id: string): Promise<boolean>;
}

export class UsersRepository implements IUsersRepository {
  private mapRow(row: Database['public']['Tables']['profiles']['Row']): UserProfile {
    return {
      id: row.id,
      email: row.email,
      displayName: row.display_name,
      partnerId: row.partner_id,
      avatarUrl: row.avatar_url,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async getById(id: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw normalizeError(error);
      if (!data) return null;

      return this.mapRow(data);
    } catch (err) {
      console.error('[UsersRepository] getById error:', err);
      return null;
    }
  }

  async getByEmail(email: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle();

      if (error) throw normalizeError(error);
      if (!data) return null;

      return this.mapRow(data);
    } catch (err) {
      console.error('[UsersRepository] getByEmail error:', err);
      return null;
    }
  }

  async getCurrentProfile(): Promise<UserProfile | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      return this.getById(user.id);
    } catch (err) {
      console.error('[UsersRepository] getCurrentProfile error:', err);
      return null;
    }
  }

  async createProfile(profile: Omit<UserProfile, 'createdAt' | 'updatedAt'>): Promise<UserProfile> {
    try {
      const payload: Database['public']['Tables']['profiles']['Insert'] = {
        id: profile.id,
        email: profile.email,
        display_name: profile.displayName,
        avatar_url: profile.avatarUrl || null,
        partner_id: profile.partnerId || null,
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'id' })
        .select()
        .single();

      if (error) throw normalizeError(error);
      return this.mapRow(data);
    } catch (err) {
      console.error('[UsersRepository] createProfile error:', err);
      throw normalizeError(err);
    }
  }

  async updateProfile(id: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const payload: Database['public']['Tables']['profiles']['Update'] = {};
      if (updates.displayName !== undefined) payload.display_name = updates.displayName;
      if (updates.email !== undefined) payload.email = updates.email;
      if (updates.avatarUrl !== undefined) payload.avatar_url = updates.avatarUrl;
      if (updates.partnerId !== undefined) payload.partner_id = updates.partnerId;

      const { data, error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw normalizeError(error);
      return this.mapRow(data);
    } catch (err) {
      console.error('[UsersRepository] updateProfile error:', err);
      throw normalizeError(err);
    }
  }

  async deleteProfile(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw normalizeError(error);
      return true;
    } catch (err) {
      console.error('[UsersRepository] deleteProfile error:', err);
      return false;
    }
  }
}

export const usersRepository = new UsersRepository();
