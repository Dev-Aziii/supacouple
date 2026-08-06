import { supabase } from '../supabase/client';
import { normalizeError } from '../errors';
import type { Database } from '../../types/database';
import { pushNotificationService } from '../notifications/pushNotificationService';

type NotificationRow = Database['public']['Tables']['notifications']['Row'];

export interface NotificationItem {
  id: string;
  recipientId: string;
  senderId?: string | null;
  type: 'plan' | 'proposal' | 'status' | 'memory' | 'system' | 'invite';
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface INotificationRepository {
  getByRecipientId(recipientId: string): Promise<NotificationItem[]>;
  markAsRead(id: string): Promise<boolean>;
  markAsUnread(id: string): Promise<boolean>;
  markAllAsRead(recipientId: string): Promise<boolean>;
  deleteNotification(id: string): Promise<boolean>;
  clearAll(recipientId: string): Promise<boolean>;
  create(notification: Omit<NotificationItem, 'id' | 'read' | 'createdAt'>): Promise<NotificationItem>;
}

export class NotificationRepository implements INotificationRepository {
  private mapRow(row: NotificationRow): NotificationItem {
    return {
      id: row.id,
      recipientId: row.recipient_id,
      senderId: row.sender_id,
      type: row.type as NotificationItem['type'],
      title: row.title,
      body: row.body,
      read: row.read,
      createdAt: row.created_at,
    };
  }

  async getByRecipientId(recipientId: string): Promise<NotificationItem[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', recipientId)
        .order('created_at', { ascending: false });

      if (error) throw normalizeError(error);
      return (data || []).map((row) => this.mapRow(row));
    } catch (err) {
      console.error('[NotificationRepository] getByRecipientId error:', err);
      return [];
    }
  }

  async markAsRead(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) throw normalizeError(error);
      return true;
    } catch (err) {
      console.error('[NotificationRepository] markAsRead error:', err);
      return false;
    }
  }

  async markAsUnread(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: false })
        .eq('id', id);

      if (error) throw normalizeError(error);
      return true;
    } catch (err) {
      console.error('[NotificationRepository] markAsUnread error:', err);
      return false;
    }
  }

  async markAllAsRead(recipientId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('recipient_id', recipientId)
        .eq('read', false);

      if (error) throw normalizeError(error);
      return true;
    } catch (err) {
      console.error('[NotificationRepository] markAllAsRead error:', err);
      return false;
    }
  }

  async deleteNotification(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw normalizeError(error);
      return true;
    } catch (err) {
      console.error('[NotificationRepository] deleteNotification error:', err);
      return false;
    }
  }

  async clearAll(recipientId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('recipient_id', recipientId);

      if (error) throw normalizeError(error);
      return true;
    } catch (err) {
      console.error('[NotificationRepository] clearAll error:', err);
      return false;
    }
  }

  async create(notification: Omit<NotificationItem, 'id' | 'read' | 'createdAt'>): Promise<NotificationItem> {
    try {
      const payload: Database['public']['Tables']['notifications']['Insert'] = {
        recipient_id: notification.recipientId,
        sender_id: notification.senderId || null,
        type: notification.type,
        title: notification.title,
        body: notification.body,
        read: false,
      };

      const { data, error } = await supabase
        .from('notifications')
        .insert(payload)
        .select()
        .single();

      if (error) throw normalizeError(error);

      const created = this.mapRow(data);

      // Asynchronously trigger Web Push notification without blocking in-app flow
      pushNotificationService
        .sendPushNotification({
          recipientId: notification.recipientId,
          title: notification.title,
          body: notification.body,
          type: notification.type,
          url:
            notification.type === 'proposal'
              ? '/proposals'
              : notification.type === 'memory'
              ? '/memories'
              : notification.type === 'plan'
              ? '/plans'
              : '/dashboard',
        })
        .catch((err) => {
          console.warn('[NotificationRepository] Background push trigger notice:', err);
        });

      return created;
    } catch (err) {
      console.error('[NotificationRepository] create error:', err);
      throw normalizeError(err);
    }
  }
}

export const notificationRepository = new NotificationRepository();
