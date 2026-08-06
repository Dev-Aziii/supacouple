import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notifications/notificationService';
import { supabase } from '../services/supabase/client';
import { useAuthStore } from '../store/authStore';
import type { NotificationItem } from '../services/repositories/notificationRepository';

export const NOTIFICATIONS_QUERY_KEY = ['notifications'];
export const UNREAD_COUNT_QUERY_KEY = ['notifications', 'unread_count'];

export function useNotifications(recipientId?: string) {
  const queryClient = useQueryClient();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const targetId = recipientId || currentUserId;

  const notificationsQuery = useQuery({
    queryKey: [...NOTIFICATIONS_QUERY_KEY, targetId],
    queryFn: () => (targetId ? notificationService.getNotifications(targetId) : Promise.resolve([])),
    enabled: Boolean(targetId),
  });

  // Realtime subscription for instant notification updates
  useEffect(() => {
    if (!targetId) return;

    const channelName = `notifications_${targetId}_${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${targetId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: [...NOTIFICATIONS_QUERY_KEY, targetId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [targetId, queryClient]);

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: [...NOTIFICATIONS_QUERY_KEY, targetId] });
      const previous = queryClient.getQueryData<NotificationItem[]>([...NOTIFICATIONS_QUERY_KEY, targetId]);
      if (previous) {
        queryClient.setQueryData<NotificationItem[]>(
          [...NOTIFICATIONS_QUERY_KEY, targetId],
          previous.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
      }
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData([...NOTIFICATIONS_QUERY_KEY, targetId], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [...NOTIFICATIONS_QUERY_KEY, targetId] });
    },
  });

  const markUnreadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsUnread(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: [...NOTIFICATIONS_QUERY_KEY, targetId] });
      const previous = queryClient.getQueryData<NotificationItem[]>([...NOTIFICATIONS_QUERY_KEY, targetId]);
      if (previous) {
        queryClient.setQueryData<NotificationItem[]>(
          [...NOTIFICATIONS_QUERY_KEY, targetId],
          previous.map((n) => (n.id === id ? { ...n, read: false } : n))
        );
      }
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData([...NOTIFICATIONS_QUERY_KEY, targetId], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [...NOTIFICATIONS_QUERY_KEY, targetId] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => (targetId ? notificationService.markAllAsRead(targetId) : Promise.resolve(false)),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: [...NOTIFICATIONS_QUERY_KEY, targetId] });
      const previous = queryClient.getQueryData<NotificationItem[]>([...NOTIFICATIONS_QUERY_KEY, targetId]);
      if (previous) {
        queryClient.setQueryData<NotificationItem[]>(
          [...NOTIFICATIONS_QUERY_KEY, targetId],
          previous.map((n) => ({ ...n, read: true }))
        );
      }
      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData([...NOTIFICATIONS_QUERY_KEY, targetId], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [...NOTIFICATIONS_QUERY_KEY, targetId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationService.deleteNotification(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: [...NOTIFICATIONS_QUERY_KEY, targetId] });
      const previous = queryClient.getQueryData<NotificationItem[]>([...NOTIFICATIONS_QUERY_KEY, targetId]);
      if (previous) {
        queryClient.setQueryData<NotificationItem[]>(
          [...NOTIFICATIONS_QUERY_KEY, targetId],
          previous.filter((n) => n.id !== id)
        );
      }
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData([...NOTIFICATIONS_QUERY_KEY, targetId], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [...NOTIFICATIONS_QUERY_KEY, targetId] });
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: () => (targetId ? notificationService.clearAll(targetId) : Promise.resolve(false)),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: [...NOTIFICATIONS_QUERY_KEY, targetId] });
      const previous = queryClient.getQueryData<NotificationItem[]>([...NOTIFICATIONS_QUERY_KEY, targetId]);
      queryClient.setQueryData<NotificationItem[]>([...NOTIFICATIONS_QUERY_KEY, targetId], []);
      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData([...NOTIFICATIONS_QUERY_KEY, targetId], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [...NOTIFICATIONS_QUERY_KEY, targetId] });
    },
  });

  const notifications = notificationsQuery.data || [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    isLoading: notificationsQuery.isLoading,
    isError: notificationsQuery.isError,
    error: notificationsQuery.error,
    refetch: notificationsQuery.refetch,
    markAsRead: markReadMutation.mutate,
    markAsUnread: markUnreadMutation.mutate,
    markAllAsRead: markAllReadMutation.mutate,
    deleteNotification: deleteMutation.mutate,
    clearAll: clearAllMutation.mutate,
    isMarkingRead: markReadMutation.isPending,
    isMarkingAllRead: markAllReadMutation.isPending,
    isClearingAll: clearAllMutation.isPending,
  };
}
