import React from 'react';
import { UnreadBadge } from './UnreadBadge';
import { cn } from '@/utils/cn';

interface NotificationTabsProps {
  activeTab: 'all' | 'unread';
  onTabChange: (tab: 'all' | 'unread') => void;
  unreadCount: number;
  totalCount: number;
}

export const NotificationTabs: React.FC<NotificationTabsProps> = ({
  activeTab,
  onTabChange,
  unreadCount,
  totalCount,
}) => {
  return (
    <div className="flex items-center gap-2 border-b border-border/40 pb-2">
      <button
        onClick={() => onTabChange('all')}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border',
          activeTab === 'all'
            ? 'bg-primary/10 text-primary border-primary/20'
            : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-accent/40'
        )}
      >
        <span>All Notifications</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
          {totalCount}
        </span>
      </button>

      <button
        onClick={() => onTabChange('unread')}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border',
          activeTab === 'unread'
            ? 'bg-primary/10 text-primary border-primary/20'
            : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-accent/40'
        )}
      >
        <span>Unread</span>
        {unreadCount > 0 && <UnreadBadge count={unreadCount} />}
      </button>
    </div>
  );
};
