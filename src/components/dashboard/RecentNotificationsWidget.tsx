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
    <Card className="border-border/60 shadow-sm bg-card/80 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-pink-500/10 text-pink-400">
            <Bell className="w-4 h-4" />
          </div>
          <span>Recent Notifications</span>
          {unreadCount > 0 && <UnreadBadge count={unreadCount} />}
        </CardTitle>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(ROUTES.NOTIFICATIONS)}
          className="text-xs text-muted-foreground hover:text-foreground rounded-xl"
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5 ml-1" />
        </Button>
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
