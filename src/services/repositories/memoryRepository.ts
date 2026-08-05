import { supabase } from '../supabase/client';
import { normalizeError } from '../errors';
import { storageService } from '../storage/storageService';
import { compressImage } from '../../utils/imageCompression';
import type {
  MemoryItem,
  MemoryAlbum,
  MemoryComment,
  MemoryReaction,
  RelationshipMilestone,
  CreateMemoryDTO,
  CreateAlbumDTO,
  CreateMilestoneDTO,
} from '../../types/memory';
import type { Database } from '../../types/database';

type MemoryRow = Database['public']['Tables']['memories']['Row'];
type AlbumRow = Database['public']['Tables']['memory_albums']['Row'];
type CommentRow = Database['public']['Tables']['memory_comments']['Row'];
type ReactionRow = Database['public']['Tables']['memory_reactions']['Row'];
type MilestoneRow = Database['public']['Tables']['relationship_milestones']['Row'];

export interface IMemoryRepository {
  list(coupleId: string): Promise<MemoryItem[]>;
  paginate(
    coupleId: string,
    page?: number,
    limit?: number,
    filters?: { albumId?: string; isFavorite?: boolean; search?: string; tag?: string }
  ): Promise<{ data: MemoryItem[]; hasMore: boolean; page: number }>;
  getById(id: string): Promise<MemoryItem | null>;
  create(dto: CreateMemoryDTO): Promise<MemoryItem>;
  update(id: string, updates: Partial<MemoryItem>): Promise<MemoryItem>;
  delete(id: string): Promise<boolean>;
  favorite(id: string): Promise<MemoryItem>;
  unfavorite(id: string): Promise<MemoryItem>;

  // Albums
  albums(coupleId: string): Promise<MemoryAlbum[]>;
  createAlbum(dto: CreateAlbumDTO): Promise<MemoryAlbum>;
  updateAlbum(id: string, updates: Partial<MemoryAlbum>): Promise<MemoryAlbum>;
  deleteAlbum(id: string): Promise<boolean>;

  // Comments
  comments(memoryId: string): Promise<MemoryComment[]>;
  addComment(memoryId: string, userId: string, content: string, parentCommentId?: string): Promise<MemoryComment>;
  editComment(commentId: string, content: string): Promise<MemoryComment>;
  deleteComment(commentId: string): Promise<boolean>;

  // Reactions
  reactions(memoryId: string): Promise<MemoryReaction[]>;
  addReaction(memoryId: string, userId: string, emoji: string): Promise<MemoryReaction>;
  removeReaction(memoryId: string, userId: string): Promise<boolean>;

  // Milestones
  milestones(coupleId: string): Promise<RelationshipMilestone[]>;
  createMilestone(dto: CreateMilestoneDTO): Promise<RelationshipMilestone>;
  deleteMilestone(id: string): Promise<boolean>;

  // Storage
  uploadImages(files: File[], coupleId: string): Promise<string[]>;
}

export class MemoryRepository implements IMemoryRepository {
  private mapMemoryRow(row: MemoryRow): MemoryItem {
    const urls = row.media_urls && row.media_urls.length > 0 ? row.media_urls : row.image_url ? [row.image_url] : [];
    return {
      id: row.id,
      coupleId: row.couple_id,
      createdBy: row.created_by || row.uploaded_by || '',
      title: row.title,
      caption: row.caption || undefined,
      description: row.description || row.caption || undefined,
      coverImage: row.cover_image || urls[0] || row.image_url || null,
      mediaUrls: urls,
      eventDate: row.memory_date,
      location: row.location || undefined,
      latitude: row.latitude || undefined,
      longitude: row.longitude || undefined,
      albumId: row.album_id || undefined,
      isFavorite: row.is_favorite ?? false,
      isPrivate: row.is_private ?? false,
      visibility: (row.visibility as MemoryItem['visibility']) || 'couple',
      weather: row.weather || undefined,
      tags: row.tags || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapAlbumRow(row: AlbumRow): MemoryAlbum {
    return {
      id: row.id,
      coupleId: row.couple_id,
      title: row.title,
      description: row.description || undefined,
      coverImage: row.cover_image || undefined,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapCommentRow(row: CommentRow): MemoryComment {
    return {
      id: row.id,
      memoryId: row.memory_id,
      parentCommentId: row.parent_comment_id || undefined,
      userId: row.user_id,
      content: row.content,
      edited: row.edited ?? false,
      deletedAt: row.deleted_at || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapReactionRow(row: ReactionRow): MemoryReaction {
    return {
      id: row.id,
      memoryId: row.memory_id,
      userId: row.user_id,
      emoji: row.emoji,
      createdAt: row.created_at,
    };
  }

  private mapMilestoneRow(row: MilestoneRow): RelationshipMilestone {
    return {
      id: row.id,
      coupleId: row.couple_id,
      title: row.title,
      description: row.description || undefined,
      date: row.date,
      type: row.type,
      coverImage: row.cover_image || undefined,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async list(coupleId: string): Promise<MemoryItem[]> {
    try {
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .eq('couple_id', coupleId)
        .order('memory_date', { ascending: false });

      if (error) throw normalizeError(error);
      return (data || []).map((r) => this.mapMemoryRow(r));
    } catch (err) {
      console.error('[MemoryRepository] list error:', err);
      return [];
    }
  }

  async paginate(
    coupleId: string,
    page = 1,
    limit = 12,
    filters?: { albumId?: string; isFavorite?: boolean; search?: string; tag?: string }
  ): Promise<{ data: MemoryItem[]; hasMore: boolean; page: number }> {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from('memories')
        .select('*', { count: 'exact' })
        .eq('couple_id', coupleId);

      if (filters?.albumId) {
        query = query.eq('album_id', filters.albumId);
      }
      if (filters?.isFavorite) {
        query = query.eq('is_favorite', true);
      }
      if (filters?.tag) {
        query = query.contains('tags', [filters.tag]);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,caption.ilike.%${filters.search}%,location.ilike.%${filters.search}%`);
      }

      query = query.order('memory_date', { ascending: false }).range(from, to);

      const { data, error, count } = await query;
      if (error) throw normalizeError(error);

      const items = (data || []).map((r) => this.mapMemoryRow(r));
      const totalCount = count ?? 0;
      const hasMore = from + items.length < totalCount;

      return { data: items, hasMore, page };
    } catch (err) {
      console.error('[MemoryRepository] paginate error:', err);
      return { data: [], hasMore: false, page };
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
      return this.mapMemoryRow(data);
    } catch (err) {
      console.error('[MemoryRepository] getById error:', err);
      return null;
    }
  }

  async create(dto: CreateMemoryDTO): Promise<MemoryItem> {
    try {
      const media = dto.mediaUrls || (dto.coverImage ? [dto.coverImage] : []);
      const payload: Database['public']['Tables']['memories']['Insert'] = {
        couple_id: dto.coupleId,
        created_by: dto.createdBy,
        uploaded_by: dto.createdBy,
        title: dto.title,
        caption: dto.caption || dto.description || null,
        description: dto.description || dto.caption || null,
        cover_image: dto.coverImage || media[0] || null,
        image_url: dto.coverImage || media[0] || '',
        media_urls: media,
        memory_date: dto.eventDate || new Date().toISOString().split('T')[0],
        location: dto.location || null,
        latitude: dto.latitude || null,
        longitude: dto.longitude || null,
        album_id: dto.albumId || null,
        is_favorite: dto.isFavorite ?? false,
        is_private: dto.isPrivate ?? false,
        visibility: dto.visibility || 'couple',
        weather: dto.weather || null,
        tags: dto.tags || [],
      };

      const { data, error } = await supabase
        .from('memories')
        .insert(payload)
        .select()
        .single();

      if (error) throw normalizeError(error);
      return this.mapMemoryRow(data);
    } catch (err) {
      console.error('[MemoryRepository] create error:', err);
      throw normalizeError(err);
    }
  }

  async update(id: string, updates: Partial<MemoryItem>): Promise<MemoryItem> {
    try {
      const payload: Database['public']['Tables']['memories']['Update'] = {};
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.caption !== undefined) payload.caption = updates.caption;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.coverImage !== undefined) payload.cover_image = updates.coverImage;
      if (updates.mediaUrls !== undefined) {
        payload.media_urls = updates.mediaUrls;
        if (updates.mediaUrls[0]) payload.image_url = updates.mediaUrls[0];
      }
      if (updates.eventDate !== undefined) payload.memory_date = updates.eventDate;
      if (updates.location !== undefined) payload.location = updates.location;
      if (updates.latitude !== undefined) payload.latitude = updates.latitude;
      if (updates.longitude !== undefined) payload.longitude = updates.longitude;
      if (updates.albumId !== undefined) payload.album_id = updates.albumId;
      if (updates.isFavorite !== undefined) payload.is_favorite = updates.isFavorite;
      if (updates.isPrivate !== undefined) payload.is_private = updates.isPrivate;
      if (updates.visibility !== undefined) payload.visibility = updates.visibility;
      if (updates.weather !== undefined) payload.weather = updates.weather;
      if (updates.tags !== undefined) payload.tags = updates.tags;

      const { data, error } = await supabase
        .from('memories')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw normalizeError(error);
      return this.mapMemoryRow(data);
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

  async favorite(id: string): Promise<MemoryItem> {
    return this.update(id, { isFavorite: true });
  }

  async unfavorite(id: string): Promise<MemoryItem> {
    return this.update(id, { isFavorite: false });
  }

  // --- Albums ---
  async albums(coupleId: string): Promise<MemoryAlbum[]> {
    try {
      const { data, error } = await supabase
        .from('memory_albums')
        .select('*')
        .eq('couple_id', coupleId)
        .order('created_at', { ascending: false });

      if (error) throw normalizeError(error);
      return (data || []).map((r) => this.mapAlbumRow(r));
    } catch (err) {
      console.error('[MemoryRepository] albums error:', err);
      return [];
    }
  }

  async createAlbum(dto: CreateAlbumDTO): Promise<MemoryAlbum> {
    try {
      const payload: Database['public']['Tables']['memory_albums']['Insert'] = {
        couple_id: dto.coupleId,
        created_by: dto.createdBy,
        title: dto.title,
        description: dto.description || null,
        cover_image: dto.coverImage || null,
      };

      const { data, error } = await supabase
        .from('memory_albums')
        .insert(payload)
        .select()
        .single();

      if (error) throw normalizeError(error);
      return this.mapAlbumRow(data);
    } catch (err) {
      console.error('[MemoryRepository] createAlbum error:', err);
      throw normalizeError(err);
    }
  }

  async updateAlbum(id: string, updates: Partial<MemoryAlbum>): Promise<MemoryAlbum> {
    try {
      const payload: Database['public']['Tables']['memory_albums']['Update'] = {};
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.coverImage !== undefined) payload.cover_image = updates.coverImage;

      const { data, error } = await supabase
        .from('memory_albums')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw normalizeError(error);
      return this.mapAlbumRow(data);
    } catch (err) {
      console.error('[MemoryRepository] updateAlbum error:', err);
      throw normalizeError(err);
    }
  }

  async deleteAlbum(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('memory_albums').delete().eq('id', id);
      if (error) throw normalizeError(error);
      return true;
    } catch (err) {
      console.error('[MemoryRepository] deleteAlbum error:', err);
      return false;
    }
  }

  // --- Comments ---
  async comments(memoryId: string): Promise<MemoryComment[]> {
    try {
      const { data, error } = await supabase
        .from('memory_comments')
        .select('*')
        .eq('memory_id', memoryId)
        .order('created_at', { ascending: true });

      if (error) throw normalizeError(error);
      return (data || []).map((r) => this.mapCommentRow(r));
    } catch (err) {
      console.error('[MemoryRepository] comments error:', err);
      return [];
    }
  }

  async addComment(
    memoryId: string,
    userId: string,
    content: string,
    parentCommentId?: string
  ): Promise<MemoryComment> {
    try {
      const payload: Database['public']['Tables']['memory_comments']['Insert'] = {
        memory_id: memoryId,
        user_id: userId,
        content,
        parent_comment_id: parentCommentId || null,
      };

      const { data, error } = await supabase
        .from('memory_comments')
        .insert(payload)
        .select()
        .single();

      if (error) throw normalizeError(error);
      return this.mapCommentRow(data);
    } catch (err) {
      console.error('[MemoryRepository] addComment error:', err);
      throw normalizeError(err);
    }
  }

  async editComment(commentId: string, content: string): Promise<MemoryComment> {
    try {
      const { data, error } = await supabase
        .from('memory_comments')
        .update({ content, edited: true })
        .eq('id', commentId)
        .select()
        .single();

      if (error) throw normalizeError(error);
      return this.mapCommentRow(data);
    } catch (err) {
      console.error('[MemoryRepository] editComment error:', err);
      throw normalizeError(err);
    }
  }

  async deleteComment(commentId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('memory_comments')
        .update({ deleted_at: new Date().toISOString(), content: '[Comment deleted]' })
        .eq('id', commentId);

      if (error) throw normalizeError(error);
      return true;
    } catch (err) {
      console.error('[MemoryRepository] deleteComment error:', err);
      return false;
    }
  }

  // --- Reactions ---
  async reactions(memoryId: string): Promise<MemoryReaction[]> {
    try {
      const { data, error } = await supabase
        .from('memory_reactions')
        .select('*')
        .eq('memory_id', memoryId);

      if (error) throw normalizeError(error);
      return (data || []).map((r) => this.mapReactionRow(r));
    } catch (err) {
      console.error('[MemoryRepository] reactions error:', err);
      return [];
    }
  }

  async addReaction(memoryId: string, userId: string, emoji: string): Promise<MemoryReaction> {
    try {
      const payload: Database['public']['Tables']['memory_reactions']['Insert'] = {
        memory_id: memoryId,
        user_id: userId,
        emoji,
      };

      const { data, error } = await supabase
        .from('memory_reactions')
        .upsert(payload, { onConflict: 'memory_id,user_id' })
        .select()
        .single();

      if (error) throw normalizeError(error);
      return this.mapReactionRow(data);
    } catch (err) {
      console.error('[MemoryRepository] addReaction error:', err);
      throw normalizeError(err);
    }
  }

  async removeReaction(memoryId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('memory_reactions')
        .delete()
        .eq('memory_id', memoryId)
        .eq('user_id', userId);

      if (error) throw normalizeError(error);
      return true;
    } catch (err) {
      console.error('[MemoryRepository] removeReaction error:', err);
      return false;
    }
  }

  // --- Milestones ---
  async milestones(coupleId: string): Promise<RelationshipMilestone[]> {
    try {
      const { data, error } = await supabase
        .from('relationship_milestones')
        .select('*')
        .eq('couple_id', coupleId)
        .order('date', { ascending: true });

      if (error) throw normalizeError(error);
      return (data || []).map((r) => this.mapMilestoneRow(r));
    } catch (err) {
      console.error('[MemoryRepository] milestones error:', err);
      return [];
    }
  }

  async createMilestone(dto: CreateMilestoneDTO): Promise<RelationshipMilestone> {
    try {
      const payload: Database['public']['Tables']['relationship_milestones']['Insert'] = {
        couple_id: dto.coupleId,
        created_by: dto.createdBy,
        title: dto.title,
        description: dto.description || null,
        date: dto.date,
        type: dto.type,
        cover_image: dto.coverImage || null,
      };

      const { data, error } = await supabase
        .from('relationship_milestones')
        .insert(payload)
        .select()
        .single();

      if (error) throw normalizeError(error);
      return this.mapMilestoneRow(data);
    } catch (err) {
      console.error('[MemoryRepository] createMilestone error:', err);
      throw normalizeError(err);
    }
  }

  async deleteMilestone(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('relationship_milestones').delete().eq('id', id);
      if (error) throw normalizeError(error);
      return true;
    } catch (err) {
      console.error('[MemoryRepository] deleteMilestone error:', err);
      return false;
    }
  }

  // --- Storage ---
  async uploadImages(files: File[], coupleId: string): Promise<string[]> {
    const uploadedUrls: string[] = [];

    for (const file of files) {
      try {
        const compressedBlob = await compressImage(file, { maxWidth: 1920, maxHeight: 1080, quality: 0.82 });
        const ext = file.name.split('.').pop() || 'jpg';
        const path = `${coupleId}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

        const { path: uploadedPath, error } = await storageService.uploadImage('memories', path, compressedBlob, {
          contentType: file.type || 'image/jpeg',
          upsert: true,
        });

        if (error || !uploadedPath) {
          console.error('[MemoryRepository] storage upload failed:', error);
          continue;
        }

        const publicUrl = storageService.getPublicUrl('memories', uploadedPath);
        uploadedUrls.push(publicUrl);
      } catch (uploadErr) {
        console.error('[MemoryRepository] image compression/upload error:', uploadErr);
      }
    }

    return uploadedUrls;
  }
}

export const memoryRepository = new MemoryRepository();
