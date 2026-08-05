import React from 'react';
import { Calendar, Heart, MessageSquare, Camera, UserPlus, Bell, Check, Trash2, MailOpen } from 'lucide-react';
import type { NotificationItem } from '@/services/repositories/notificationRepository';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

interface NotificationCardProps {
  notification: NotificationItem;
  onMarkAsRead: (id: string) => void;
  onMarkAsUnread: (id: string) => void;
  onDelete: (id: string) => void;
}

const TYPE_CONFIG: Record<
  NotificationItem['type'],
  { icon: React.ElementType; color: string; bg: string }
> = {
  plan: { icon: Calendar, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  proposal: { icon: Heart, color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' },
  status: { icon: MessageSquare, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  memory: { icon: Camera, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
  invite: { icon: UserPlus, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  system: { icon: Bell, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
};

function formatTimeAgo(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onMarkAsRead,
  onMarkAsUnread,
  onDelete,
}) => {
  const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG.system;
  const Icon = config.icon;

  return (
    <div
      tabIndex={0}
      role="article"
      aria-label={`${notification.title}: ${notification.body}`}
      className={cn(
        'group relative flex items-start justify-between gap-4 p-4 rounded-2xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50',
        notification.read
          ? 'bg-card/50 border-border/40 text-muted-foreground'
          : 'bg-card border-primary/20 shadow-sm text-foreground hover:border-primary/40'
      )}
    >
      <div className="flex items-start gap-3.5 min-w-0">
        <div
          className={cn(
            'p-2.5 rounded-xl border flex-shrink-0 flex items-center justify-center',
            config.bg
          )}
        >
          <Icon className={cn('w-5 h-5', config.color)} />
        </div>

        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4
              className={cn(
                'text-sm font-semibold truncate',
                notification.read ? 'text-foreground/80' : 'text-foreground'
              )}
            >
              {notification.title}
            </h4>
            {!notification.read && (
              <span className="w-2 h-2 rounded-full bg-pink-500 flex-shrink-0 animate-pulse" />
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {notification.body}
          </p>
          <span className="text-[11px] text-muted-foreground/70 block pt-0.5">
            {formatTimeAgo(notification.createdAt)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity flex-shrink-0">
        {notification.read ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMarkAsUnread(notification.id)}
            title="Mark as unread"
            aria-label="Mark notification as unread"
            className="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground"
          >
            <MailOpen className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMarkAsRead(notification.id)}
            title="Mark as read"
            aria-label="Mark notification as read"
            className="w-8 h-8 rounded-lg text-muted-foreground hover:text-pink-400"
          >
            <Check className="w-4 h-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(notification.id)}
          title="Delete notification"
          aria-label="Delete notification"
          className="w-8 h-8 rounded-lg text-muted-foreground hover:text-rose-500"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
