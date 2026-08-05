import { memoryRepository } from '../repositories/memoryRepository';
import { notificationRepository } from '../repositories/notificationRepository';
import { activityService } from '../activity/activityService';
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

const OFFLINE_MEMORIES_QUEUE_KEY = 'supacouple_offline_memories_queue';

export interface OfflineMemoryAction {
  id: string;
  type:
    | 'createMemory'
    | 'editMemory'
    | 'deleteMemory'
    | 'favoriteMemory'
    | 'moveToAlbum'
    | 'createAlbum'
    | 'renameAlbum'
    | 'deleteAlbum'
    | 'addComment'
    | 'editComment'
    | 'deleteComment'
    | 'react'
    | 'removeReaction'
    | 'createMilestone';
  payload: unknown;
  partnerId?: string | null;
  timestamp: number;
}

export class MemoryService {
  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.processOfflineQueue().catch((err) =>
          console.error('[MemoryService] Auto-flushing offline queue failed:', err)
        );
      });
    }
  }

  // --- Offline Queue Handling ---
  private getOfflineQueue(): OfflineMemoryAction[] {
    try {
      const raw = localStorage.getItem(OFFLINE_MEMORIES_QUEUE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveOfflineQueue(queue: OfflineMemoryAction[]): void {
    try {
      localStorage.setItem(OFFLINE_MEMORIES_QUEUE_KEY, JSON.stringify(queue));
    } catch (err) {
      console.error('[MemoryService] Failed to save offline queue:', err);
    }
  }

  private enqueueOfflineAction(action: OfflineMemoryAction): void {
    const queue = this.getOfflineQueue();
    queue.push(action);
    this.saveOfflineQueue(queue);
  }

  async processOfflineQueue(): Promise<void> {
    if (!navigator.onLine) return;
    const queue = this.getOfflineQueue();
    if (queue.length === 0) return;

    this.saveOfflineQueue([]);

    for (const action of queue) {
      try {
        switch (action.type) {
          case 'createMemory':
            await this.createMemory(action.payload as CreateMemoryDTO, action.partnerId);
            break;
          case 'editMemory': {
            const p = action.payload as { id: string; updates: Partial<MemoryItem> };
            await this.editMemory(p.id, p.updates);
            break;
          }
          case 'deleteMemory':
            await this.deleteMemory((action.payload as { id: string }).id);
            break;
          case 'favoriteMemory': {
            const p = action.payload as { id: string; fav: boolean };
            await this.favoriteMemory(p.id, p.fav);
            break;
          }
          case 'moveToAlbum': {
            const p = action.payload as { memoryId: string; albumId: string | null };
            await this.moveToAlbum(p.memoryId, p.albumId);
            break;
          }
          case 'createAlbum':
            await this.createAlbum(action.payload as CreateAlbumDTO, action.partnerId);
            break;
          case 'renameAlbum': {
            const p = action.payload as { albumId: string; title: string };
            await this.renameAlbum(p.albumId, p.title);
            break;
          }
          case 'deleteAlbum':
            await this.deleteAlbum((action.payload as { id: string }).id);
            break;
          case 'addComment': {
            const p = action.payload as {
              memoryId: string;
              userId: string;
              content: string;
              parentCommentId?: string;
            };
            await this.addComment(p.memoryId, p.userId, p.content, p.parentCommentId, action.partnerId);
            break;
          }
          case 'editComment': {
            const p = action.payload as { commentId: string; content: string };
            await this.editComment(p.commentId, p.content);
            break;
          }
          case 'deleteComment':
            await this.deleteComment((action.payload as { id: string }).id);
            break;
          case 'react': {
            const p = action.payload as { memoryId: string; userId: string; emoji: string };
            await this.react(p.memoryId, p.userId, p.emoji, action.partnerId);
            break;
          }
          case 'removeReaction': {
            const p = action.payload as { memoryId: string; userId: string };
            await this.removeReaction(p.memoryId, p.userId);
            break;
          }
          case 'createMilestone':
            await this.createMilestone(action.payload as CreateMilestoneDTO, action.partnerId);
            break;
        }
      } catch (err) {
        console.error('[MemoryService] Processing offline action failed:', action, err);
      }
    }
  }

  // --- Service Methods ---

  async createMemory(dto: CreateMemoryDTO, partnerId?: string | null): Promise<MemoryItem> {
    if (!navigator.onLine) {
      const fakeId = `offline-mem-${Date.now()}`;
      const fake: MemoryItem = {
        id: fakeId,
        coupleId: dto.coupleId,
        createdBy: dto.createdBy,
        title: dto.title,
        caption: dto.caption,
        description: dto.description || dto.caption,
        coverImage: dto.coverImage || dto.mediaUrls?.[0] || null,
        mediaUrls: dto.mediaUrls || [],
        eventDate: dto.eventDate || new Date().toISOString().split('T')[0],
        location: dto.location,
        latitude: dto.latitude,
        longitude: dto.longitude,
        albumId: dto.albumId,
        isFavorite: dto.isFavorite ?? false,
        isPrivate: dto.isPrivate ?? false,
        visibility: dto.visibility || 'couple',
        weather: dto.weather,
        tags: dto.tags || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.enqueueOfflineAction({
        id: fakeId,
        type: 'createMemory',
        payload: dto,
        partnerId,
        timestamp: Date.now(),
      });

      return fake;
    }

    const created = await memoryRepository.create(dto);

    // Activity log
    await activityService.createActivity({
      coupleId: dto.coupleId,
      userId: dto.createdBy,
      type: 'memory_created',
      title: `Added memory "${created.title}"`,
      description: created.caption || created.description || undefined,
      metadata: { memoryId: created.id, coverImage: created.coverImage },
    });

    // Partner notification
    if (partnerId) {
      await notificationRepository.create({
        recipientId: partnerId,
        senderId: dto.createdBy,
        type: 'memory',
        title: 'New Memory Added 📸',
        body: `A new memory "${created.title}" was shared!`,
      });
    }

    return created;
  }

  async editMemory(id: string, updates: Partial<MemoryItem>): Promise<MemoryItem> {
    if (!navigator.onLine) {
      this.enqueueOfflineAction({
        id: `offline-edit-${Date.now()}`,
        type: 'editMemory',
        payload: { id, updates },
        timestamp: Date.now(),
      });
      return { id, title: updates.title || 'Updated Memory', ...updates } as MemoryItem;
    }
    return memoryRepository.update(id, updates);
  }

  async deleteMemory(id: string): Promise<boolean> {
    if (!navigator.onLine) {
      this.enqueueOfflineAction({
        id: `offline-del-${Date.now()}`,
        type: 'deleteMemory',
        payload: { id },
        timestamp: Date.now(),
      });
      return true;
    }
    return memoryRepository.delete(id);
  }

  async favoriteMemory(id: string, fav: boolean): Promise<MemoryItem> {
    if (!navigator.onLine) {
      this.enqueueOfflineAction({
        id: `offline-fav-${Date.now()}`,
        type: 'favoriteMemory',
        payload: { id, fav },
        timestamp: Date.now(),
      });
      return { id, isFavorite: fav } as MemoryItem;
    }
    const updated = fav ? await memoryRepository.favorite(id) : await memoryRepository.unfavorite(id);

    if (fav) {
      await activityService.createActivity({
        coupleId: updated.coupleId,
        userId: updated.createdBy,
        type: 'memory_favorited',
        title: `Favorited memory "${updated.title}" ❤️`,
        metadata: { memoryId: updated.id },
      });
    }

    return updated;
  }

  async moveToAlbum(memoryId: string, albumId: string | null): Promise<MemoryItem> {
    if (!navigator.onLine) {
      this.enqueueOfflineAction({
        id: `offline-album-move-${Date.now()}`,
        type: 'moveToAlbum',
        payload: { memoryId, albumId },
        timestamp: Date.now(),
      });
      return { id: memoryId, albumId: albumId || undefined } as MemoryItem;
    }
    return memoryRepository.update(memoryId, { albumId: albumId || undefined });
  }

  // --- Albums ---

  async createAlbum(dto: CreateAlbumDTO, partnerId?: string | null): Promise<MemoryAlbum> {
    if (!navigator.onLine) {
      const fakeId = `offline-album-${Date.now()}`;
      const fake: MemoryAlbum = {
        id: fakeId,
        coupleId: dto.coupleId,
        createdBy: dto.createdBy,
        title: dto.title,
        description: dto.description,
        coverImage: dto.coverImage,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.enqueueOfflineAction({
        id: fakeId,
        type: 'createAlbum',
        payload: dto,
        partnerId,
        timestamp: Date.now(),
      });

      return fake;
    }

    const created = await memoryRepository.createAlbum(dto);

    await activityService.createActivity({
      coupleId: dto.coupleId,
      userId: dto.createdBy,
      type: 'album_created',
      title: `Created album "${created.title}" 🖼️`,
      description: created.description || undefined,
      metadata: { albumId: created.id },
    });

    if (partnerId) {
      await notificationRepository.create({
        recipientId: partnerId,
        senderId: dto.createdBy,
        type: 'memory',
        title: 'New Album Created 📁',
        body: `Created the album "${created.title}" for your memories!`,
      });
    }

    return created;
  }

  async renameAlbum(albumId: string, title: string): Promise<MemoryAlbum> {
    if (!navigator.onLine) {
      this.enqueueOfflineAction({
        id: `offline-rename-alb-${Date.now()}`,
        type: 'renameAlbum',
        payload: { albumId, title },
        timestamp: Date.now(),
      });
      return { id: albumId, title } as MemoryAlbum;
    }
    return memoryRepository.updateAlbum(albumId, { title });
  }

  async deleteAlbum(id: string): Promise<boolean> {
    if (!navigator.onLine) {
      this.enqueueOfflineAction({
        id: `offline-del-alb-${Date.now()}`,
        type: 'deleteAlbum',
        payload: { id },
        timestamp: Date.now(),
      });
      return true;
    }
    return memoryRepository.deleteAlbum(id);
  }

  // --- Comments ---

  async addComment(
    memoryId: string,
    userId: string,
    content: string,
    parentCommentId?: string,
    partnerId?: string | null
  ): Promise<MemoryComment> {
    if (!navigator.onLine) {
      const fakeId = `offline-comm-${Date.now()}`;
      const fake: MemoryComment = {
        id: fakeId,
        memoryId,
        userId,
        content,
        parentCommentId,
        edited: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.enqueueOfflineAction({
        id: fakeId,
        type: 'addComment',
        payload: { memoryId, userId, content, parentCommentId },
        partnerId,
        timestamp: Date.now(),
      });

      return fake;
    }

    const comment = await memoryRepository.addComment(memoryId, userId, content, parentCommentId);
    const memory = await memoryRepository.getById(memoryId);

    if (memory) {
      await activityService.createActivity({
        coupleId: memory.coupleId,
        userId,
        type: 'memory_commented',
        title: `Commented on memory "${memory.title}" 💬`,
        description: content,
        metadata: { memoryId, commentId: comment.id },
      });

      if (partnerId) {
        await notificationRepository.create({
          recipientId: partnerId,
          senderId: userId,
          type: 'memory',
          title: 'New Memory Comment 💭',
          body: `Left a comment on "${memory.title}": ${content.substring(0, 50)}...`,
        });
      }
    }

    return comment;
  }

  async editComment(commentId: string, content: string): Promise<MemoryComment> {
    if (!navigator.onLine) {
      this.enqueueOfflineAction({
        id: `offline-edit-comm-${Date.now()}`,
        type: 'editComment',
        payload: { commentId, content },
        timestamp: Date.now(),
      });
      return { id: commentId, content, edited: true } as MemoryComment;
    }
    return memoryRepository.editComment(commentId, content);
  }

  async deleteComment(commentId: string): Promise<boolean> {
    if (!navigator.onLine) {
      this.enqueueOfflineAction({
        id: `offline-del-comm-${Date.now()}`,
        type: 'deleteComment',
        payload: { id: commentId },
        timestamp: Date.now(),
      });
      return true;
    }
    return memoryRepository.deleteComment(commentId);
  }

  // --- Reactions ---

  async react(
    memoryId: string,
    userId: string,
    emoji: string,
    partnerId?: string | null
  ): Promise<MemoryReaction> {
    if (!navigator.onLine) {
      const fakeId = `offline-react-${Date.now()}`;
      const fake: MemoryReaction = {
        id: fakeId,
        memoryId,
        userId,
        emoji,
        createdAt: new Date().toISOString(),
      };

      this.enqueueOfflineAction({
        id: fakeId,
        type: 'react',
        payload: { memoryId, userId, emoji },
        partnerId,
        timestamp: Date.now(),
      });

      return fake;
    }

    const reaction = await memoryRepository.addReaction(memoryId, userId, emoji);
    const memory = await memoryRepository.getById(memoryId);

    if (memory && partnerId) {
      await notificationRepository.create({
        recipientId: partnerId,
        senderId: userId,
        type: 'memory',
        title: `Reacted ${emoji} to memory`,
        body: `Reacted with ${emoji} to "${memory.title}"!`,
      });
    }

    return reaction;
  }

  async removeReaction(memoryId: string, userId: string): Promise<boolean> {
    if (!navigator.onLine) {
      this.enqueueOfflineAction({
        id: `offline-unreact-${Date.now()}`,
        type: 'removeReaction',
        payload: { memoryId, userId },
        timestamp: Date.now(),
      });
      return true;
    }
    return memoryRepository.removeReaction(memoryId, userId);
  }

  // --- Milestones ---

  async createMilestone(
    dto: CreateMilestoneDTO,
    partnerId?: string | null
  ): Promise<RelationshipMilestone> {
    if (!navigator.onLine) {
      const fakeId = `offline-ms-${Date.now()}`;
      const fake: RelationshipMilestone = {
        id: fakeId,
        coupleId: dto.coupleId,
        createdBy: dto.createdBy,
        title: dto.title,
        description: dto.description,
        date: dto.date,
        type: dto.type,
        coverImage: dto.coverImage,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.enqueueOfflineAction({
        id: fakeId,
        type: 'createMilestone',
        payload: dto,
        partnerId,
        timestamp: Date.now(),
      });

      return fake;
    }

    const milestone = await memoryRepository.createMilestone(dto);

    await activityService.createActivity({
      coupleId: dto.coupleId,
      userId: dto.createdBy,
      type: 'milestone_created',
      title: `Celebrated Milestone: "${milestone.title}" 🎉`,
      description: milestone.description || undefined,
      metadata: { milestoneId: milestone.id },
    });

    if (partnerId) {
      await notificationRepository.create({
        recipientId: partnerId,
        senderId: dto.createdBy,
        type: 'system',
        title: 'New Milestone Added ✨',
        body: `Added a milestone "${milestone.title}" to your relationship timeline!`,
      });
    }

    return milestone;
  }

  async deleteMilestone(id: string): Promise<boolean> {
    return memoryRepository.deleteMilestone(id);
  }
}

export const memoryService = new MemoryService();
