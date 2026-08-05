import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronRight } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UnreadBadge } from '@/components/notifications/UnreadBadge';
import { NotificationCard } from '@/components/notifications/NotificationCard';
import { ROUTES } from '@/constants/routes';

export const RecentNotificationsWidget: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAsUnread, deleteNotification } = useNotifications();

  const recent = notifications.slice(0, 3);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-foreground flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            <span>Recent Notifications</span>
            {unreadCount > 0 && <UnreadBadge count={unreadCount} />}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(ROUTES.NOTIFICATIONS)}
            className="text-xs text-primary hover:underline h-auto p-0"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-2">
        {recent.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            No notifications yet. Updates will appear here!
          </p>
        ) : (
          recent.map((n) => (
            <NotificationCard
              key={n.id}
              notification={n}
              onMarkAsRead={markAsRead}
              onMarkAsUnread={markAsUnread}
              onDelete={deleteNotification}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
};

