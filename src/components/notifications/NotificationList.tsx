import React from 'react';
import type { NotificationItem } from '@/services/repositories/notificationRepository';
import { notificationService } from '@/services/notifications/notificationService';
import { NotificationCard } from './NotificationCard';
import { NotificationEmpty } from './NotificationEmpty';

interface NotificationListProps {
  notifications: NotificationItem[];
  filter: string;
  onMarkAsRead: (id: string) => void;
  onMarkAsUnread: (id: string) => void;
  onDelete: (id: string) => void;
  onClearFilter?: () => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  filter,
  onMarkAsRead,
  onMarkAsUnread,
  onDelete,
  onClearFilter,
}) => {
  if (notifications.length === 0) {
    return <NotificationEmpty filter={filter} onClearFilter={onClearFilter} />;
  }

  const { today, yesterday, earlier } = notificationService.groupNotificationsByDate(notifications);

  return (
    <div className="space-y-6">
      {today.length > 0 && (
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 px-1">
            Today
          </h3>
          <div className="space-y-2.5">
            {today.map((n) => (
              <NotificationCard
                key={n.id}
                notification={n}
                onMarkAsRead={onMarkAsRead}
                onMarkAsUnread={onMarkAsUnread}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}

      {yesterday.length > 0 && (
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 px-1">
            Yesterday
          </h3>
          <div className="space-y-2.5">
            {yesterday.map((n) => (
              <NotificationCard
                key={n.id}
                notification={n}
                onMarkAsRead={onMarkAsRead}
                onMarkAsUnread={onMarkAsUnread}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}

      {earlier.length > 0 && (
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 px-1">
            Earlier
          </h3>
          <div className="space-y-2.5">
            {earlier.map((n) => (
              <NotificationCard
                key={n.id}
                notification={n}
                onMarkAsRead={onMarkAsRead}
                onMarkAsUnread={onMarkAsUnread}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
