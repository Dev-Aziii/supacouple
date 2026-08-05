import { notificationRepository, type NotificationItem } from '../repositories/notificationRepository';

export interface GroupedNotifications {
  today: NotificationItem[];
  yesterday: NotificationItem[];
  earlier: NotificationItem[];
}

export class NotificationService {
  async getNotifications(recipientId: string): Promise<NotificationItem[]> {
    return notificationRepository.getByRecipientId(recipientId);
  }

  async markAsRead(id: string): Promise<boolean> {
    return notificationRepository.markAsRead(id);
  }

  async markAsUnread(id: string): Promise<boolean> {
    return notificationRepository.markAsUnread(id);
  }

  async markAllAsRead(recipientId: string): Promise<boolean> {
    return notificationRepository.markAllAsRead(recipientId);
  }

  async deleteNotification(id: string): Promise<boolean> {
    return notificationRepository.deleteNotification(id);
  }

  async clearAll(recipientId: string): Promise<boolean> {
    return notificationRepository.clearAll(recipientId);
  }

  groupNotificationsByDate(notifications: NotificationItem[]): GroupedNotifications {
    const today: NotificationItem[] = [];
    const yesterday: NotificationItem[] = [];
    const earlier: NotificationItem[] = [];

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 86400000;

    notifications.forEach((item) => {
      const itemTime = new Date(item.createdAt).getTime();
      if (itemTime >= todayStart) {
        today.push(item);
      } else if (itemTime >= yesterdayStart) {
        yesterday.push(item);
      } else {
        earlier.push(item);
      }
    });

    return { today, yesterday, earlier };
  }

  filterNotifications(
    notifications: NotificationItem[],
    filter: string,
    searchQuery: string
  ): NotificationItem[] {
    let result = notifications;

    if (filter === 'unread') {
      result = result.filter((n) => !n.read);
    } else if (filter !== 'all') {
      result = result.filter((n) => n.type === filter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (n) => n.title.toLowerCase().includes(query) || n.body.toLowerCase().includes(query)
      );
    }

    return result;
  }
}

export const notificationService = new NotificationService();
