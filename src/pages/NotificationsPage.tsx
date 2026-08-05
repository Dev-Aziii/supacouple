import React, { useState } from 'react';
import { Bell, CheckCheck, Trash2, Search, Loader2 } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useSettingsStore } from '@/store/settingsStore';
import { notificationService } from '@/services/notifications/notificationService';
import { NotificationList } from '@/components/notifications/NotificationList';
import { NotificationFilter } from '@/components/notifications/NotificationFilter';
import { NotificationTabs } from '@/components/notifications/NotificationTabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const NotificationsPage: React.FC = () => {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    clearAll,
    isMarkingAllRead,
    isClearingAll,
  } = useNotifications();

  const {
    activeNotificationsFilter,
    notificationSearchQuery,
    setNotificationsFilter,
    setNotificationSearchQuery,
  } = useSettingsStore();

  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  const activeFilter = activeTab === 'unread' ? 'unread' : activeNotificationsFilter;

  const filteredNotifications = notificationService.filterNotifications(
    notifications,
    activeFilter,
    notificationSearchQuery
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 tracking-tight">
            <div className="p-2 rounded-2xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
              <Bell className="w-7 h-7" />
            </div>
            <span>Notification Center</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Stay up to date with plans, proposals, memories, and partner updates
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllAsRead()}
              disabled={isMarkingAllRead}
              className="rounded-xl border-border/60 hover:border-primary/40 text-xs font-semibold"
            >
              {isMarkingAllRead ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
              ) : (
                <CheckCheck className="w-3.5 h-3.5 mr-1.5 text-pink-400" />
              )}
              Mark all read
            </Button>
          )}

          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all notifications?')) {
                  clearAll();
                }
              }}
              disabled={isClearingAll}
              className="rounded-xl text-xs text-muted-foreground hover:text-rose-500"
            >
              {isClearingAll ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
              ) : (
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              )}
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <NotificationTabs
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
              if (tab === 'all' && activeNotificationsFilter === 'unread') {
                setNotificationsFilter('all');
              }
            }}
            unreadCount={unreadCount}
            totalCount={notifications.length}
          />

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search notifications..."
              value={notificationSearchQuery}
              onChange={(e) => setNotificationSearchQuery(e.target.value)}
              className="pl-9 text-xs rounded-xl bg-card/60 border-border/40 focus-visible:ring-primary/40"
            />
          </div>
        </div>

        {/* Filter Pill Selector */}
        {activeTab === 'all' && (
          <NotificationFilter
            activeFilter={activeNotificationsFilter}
            onFilterChange={setNotificationsFilter}
          />
        )}
      </div>

      {/* Notification List Content */}
      {isLoading ? (
        <div className="flex items-center justify-center p-16 text-muted-foreground gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-pink-400" />
          <span className="text-sm font-medium">Loading notifications...</span>
        </div>
      ) : (
        <NotificationList
          notifications={filteredNotifications}
          filter={activeFilter}
          onMarkAsRead={markAsRead}
          onMarkAsUnread={markAsUnread}
          onDelete={deleteNotification}
          onClearFilter={() => setNotificationsFilter('all')}
        />
      )}
    </div>
  );
};
