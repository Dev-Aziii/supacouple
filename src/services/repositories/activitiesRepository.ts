import { supabase } from '../supabase/client';
import { normalizeError } from '../errors';
import type { Database, Json } from '../../types/database';
import type { ActivityItem, CreateActivityDTO, ActivityType, ActivityMetadata } from '../../types/activity';

type ActivityRow = Database['public']['Tables']['activities']['Row'];
type ActivityRowWithProfile = ActivityRow & {
  profiles?: { display_name: string; avatar_url: string | null } | null;
};

export interface IActivitiesRepository {
  create(dto: CreateActivityDTO): Promise<ActivityItem>;
  list(coupleId: string, limit?: number): Promise<ActivityItem[]>;
  latest(coupleId: string, limit?: number): Promise<ActivityItem[]>;
  paginate(
    coupleId: string,
    page?: number,
    limit?: number
  ): Promise<{ data: ActivityItem[]; hasMore: boolean; page: number }>;
  markViewed(activityId: string, userId: string): Promise<boolean>;
}

export class ActivitiesRepository implements IActivitiesRepository {
  private mapRow(row: ActivityRowWithProfile): ActivityItem {
    const profile = row.profiles;
    return {
      id: row.id,
      coupleId: row.couple_id,
      userId: row.user_id,
      type: row.type as ActivityType,
      title: row.title,
      description: row.description || undefined,
      metadata: (row.metadata as ActivityMetadata) || {},
      createdAt: row.created_at,
      userProfile: profile
        ? {
            displayName: profile.display_name,
            avatarUrl: profile.avatar_url || undefined,
          }
        : undefined,
    };
  }

  async create(dto: CreateActivityDTO): Promise<ActivityItem> {
    try {
      const payload: Database['public']['Tables']['activities']['Insert'] = {
        couple_id: dto.coupleId,
        user_id: dto.userId,
        type: dto.type,
        title: dto.title,
        description: dto.description || null,
        metadata: (dto.metadata || {}) as Json,
      };

      const { data, error } = await supabase
        .from('activities')
        .insert(payload)
        .select('*, profiles:user_id(display_name, avatar_url)')
        .single();

      if (error) throw normalizeError(error);
      return this.mapRow(data);
    } catch (err) {
      console.error('[ActivitiesRepository] create error:', err);
      throw err;
    }
  }

  async list(coupleId: string, limit = 50): Promise<ActivityItem[]> {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*, profiles:user_id(display_name, avatar_url)')
        .eq('couple_id', coupleId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw normalizeError(error);
      return (data || []).map((row) => this.mapRow(row));
    } catch (err) {
      console.error('[ActivitiesRepository] list error:', err);
      return [];
    }
  }

  async latest(coupleId: string, limit = 10): Promise<ActivityItem[]> {
    return this.list(coupleId, limit);
  }

  async paginate(
    coupleId: string,
    page = 1,
    limit = 15
  ): Promise<{ data: ActivityItem[]; hasMore: boolean; page: number }> {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from('activities')
        .select('*, profiles:user_id(display_name, avatar_url)', { count: 'exact' })
        .eq('couple_id', coupleId)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw normalizeError(error);
      const items = (data || []).map((row) => this.mapRow(row));
      const totalCount = count ?? 0;
      const hasMore = from + items.length < totalCount;

      return {
        data: items,
        hasMore,
        page,
      };
    } catch (err) {
      console.error('[ActivitiesRepository] paginate error:', err);
      return { data: [], hasMore: false, page };
    }
  }

  async markViewed(activityId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_activity_views')
        .upsert(
          {
            activity_id: activityId,
            user_id: userId,
            viewed_at: new Date().toISOString(),
          },
          { onConflict: 'activity_id,user_id' }
        );

      if (error) throw normalizeError(error);
      return true;
    } catch (err) {
      console.error('[ActivitiesRepository] markViewed error:', err);
      return false;
    }
  }
}

export const activitiesRepository = new ActivitiesRepository();
