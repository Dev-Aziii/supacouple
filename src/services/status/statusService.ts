import { statusRepository } from '../repositories/statusRepository';
import { notificationRepository } from '../repositories/notificationRepository';
import { activityService } from '../activity/activityService';
import type { StatusUpdate, PresetStatusType } from '../../types/status';

const OFFLINE_STATUS_QUEUE_KEY = 'supacouple_offline_status_queue';

export interface SetStatusPayload {
  userId: string;
  coupleId?: string | null;
  partnerId?: string | null;
  statusType?: PresetStatusType;
  mood?: string | null;
  statusMessage?: string | null;
  expiresAt?: string | null;
}

export class StatusService {
  /**
   * Set a new status for the current user. Handles offline fallback.
   */
  async setStatus(payload: SetStatusPayload): Promise<StatusUpdate> {
    if (!navigator.onLine) {
      this.enqueueOfflineStatus(payload);
      const fakeStatus: StatusUpdate = {
        id: `offline-${Date.now()}`,
        userId: payload.userId,
        coupleId: payload.coupleId,
        statusType: payload.statusType || 'custom',
        mood: payload.mood || '💬',
        statusMessage: payload.statusMessage || '',
        customStatus: payload.statusMessage || '',
        expiresAt: payload.expiresAt || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return fakeStatus;
    }

    const created = await statusRepository.createStatus({
      userId: payload.userId,
      coupleId: payload.coupleId || undefined,
      emoji: payload.mood || '💬',
      statusMessage: payload.statusMessage || '',
      expiresAt: payload.expiresAt || null,
    });

    if (payload.coupleId) {
      try {
        await activityService.createActivity({
          coupleId: payload.coupleId,
          userId: payload.userId,
          type: 'status_updated',
          title: 'updated status',
          description: payload.statusMessage || undefined,
          metadata: { emoji: payload.mood || '💬' },
        });
      } catch (err) {
        console.warn('[StatusService] Activity creation fallback warning:', err);
      }
    }

    // Send partner notification if partnered
    if (payload.partnerId) {
      try {
        await notificationRepository.create({
          recipientId: payload.partnerId,
          senderId: payload.userId,
          type: 'status',
          title: 'Partner Status Updated',
          body: `${payload.mood || '💬'} ${payload.statusMessage || 'Updated their status'}`,
        });
      } catch (err) {
        console.warn('[StatusService] Failed to notify partner of status update:', err);
      }
    }

    return created;
  }

  /**
   * Delete / clear current status.
   */
  async clearStatus(statusId: string, partnerId?: string | null, userId?: string): Promise<boolean> {
    const success = await statusRepository.deleteStatus(statusId);
    if (success && partnerId && userId) {
      try {
        await notificationRepository.create({
          recipientId: partnerId,
          senderId: userId,
          type: 'status',
          title: 'Partner Status Cleared',
          body: 'Partner cleared their status.',
        });
      } catch (err) {
        console.warn('[StatusService] Failed to send clear notification:', err);
      }
    }
    return success;
  }

  /**
   * Update existing status text or emoji.
   */
  async updateStatus(id: string, updates: Partial<StatusUpdate>): Promise<StatusUpdate> {
    return statusRepository.updateStatus(id, updates);
  }

  /**
   * Get active status for user.
   */
  async getCurrentStatus(userId: string): Promise<StatusUpdate | null> {
    return statusRepository.getLatestStatus(userId);
  }

  /**
   * Get active status for partner.
   */
  async getPartnerStatus(partnerId: string): Promise<StatusUpdate | null> {
    return statusRepository.getPartnerStatus(partnerId);
  }

  /**
   * Get last 30 status items for user history.
   */
  async getStatusHistory(userId: string, limit = 30): Promise<StatusUpdate[]> {
    return statusRepository.getStatusHistory(userId, limit);
  }

  /**
   * Mark status as expired.
   */
  async expireStatus(statusId: string, partnerId?: string | null, userId?: string): Promise<boolean> {
    const success = await statusRepository.expireStatus(statusId);
    if (success && partnerId && userId) {
      try {
        await notificationRepository.create({
          recipientId: partnerId,
          senderId: userId,
          type: 'status',
          title: 'Partner Status Expired',
          body: 'Partner status has expired.',
        });
      } catch (err) {
        console.warn('[StatusService] Failed to notify partner of expiration:', err);
      }
    }
    return success;
  }

  /**
   * Save payload to localStorage when offline.
   */
  private enqueueOfflineStatus(payload: SetStatusPayload): void {
    try {
      const existingRaw = localStorage.getItem(OFFLINE_STATUS_QUEUE_KEY);
      const queue: SetStatusPayload[] = existingRaw ? JSON.parse(existingRaw) : [];
      queue.push(payload);
      localStorage.setItem(OFFLINE_STATUS_QUEUE_KEY, JSON.stringify(queue));
    } catch (err) {
      console.error('[StatusService] Failed to enqueue offline status:', err);
    }
  }

  /**
   * Flush pending offline status updates when online re-established.
   */
  async processOfflineQueue(): Promise<void> {
    if (!navigator.onLine) return;
    try {
      const existingRaw = localStorage.getItem(OFFLINE_STATUS_QUEUE_KEY);
      if (!existingRaw) return;
      const queue: SetStatusPayload[] = JSON.parse(existingRaw);
      if (!queue.length) return;

      localStorage.removeItem(OFFLINE_STATUS_QUEUE_KEY);

      for (const payload of queue) {
        await this.setStatus(payload);
      }
    } catch (err) {
      console.error('[StatusService] Failed to process offline status queue:', err);
    }
  }
}

export const statusService = new StatusService();
