import { useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { statusService, SetStatusPayload } from '../services/status/statusService';
import { queryKeys } from '../constants/queryKeys';
import { supabase } from '../services/supabase/client';
import { useSession } from './useSession';
import { useCouple } from './useCouple';
import type { StatusUpdate } from '../types/status';

export function useStatus() {
  const queryClient = useQueryClient();
  const { user } = useSession();
  const { partner, couple } = useCouple();

  const userId = user?.id;
  const partnerId = partner?.id;
  const coupleId = couple?.id;

  // 1. Current User Status Query
  const currentUserStatusQuery = useQuery<StatusUpdate | null>({
    queryKey: queryKeys.status.user(userId ?? 'me'),
    queryFn: async () => {
      if (!userId) return null;
      return statusService.getCurrentStatus(userId);
    },
    enabled: Boolean(userId),
    staleTime: 1000 * 30, // 30 seconds
  });

  // 2. Partner Status Query
  const partnerStatusQuery = useQuery<StatusUpdate | null>({
    queryKey: queryKeys.status.user(partnerId ?? 'partner'),
    queryFn: async () => {
      if (!partnerId) return null;
      return statusService.getPartnerStatus(partnerId);
    },
    enabled: Boolean(partnerId),
    staleTime: 1000 * 30,
  });

  // 3. Status History Query
  const statusHistoryQuery = useQuery<StatusUpdate[]>({
    queryKey: [...queryKeys.status.all, 'history', userId ?? 'me'],
    queryFn: async () => {
      if (!userId) return [];
      return statusService.getStatusHistory(userId, 30);
    },
    enabled: Boolean(userId),
  });

  // Invalidate status queries helper
  const invalidateStatusQueries = useCallback(() => {
    if (userId) queryClient.invalidateQueries({ queryKey: queryKeys.status.user(userId) });
    if (partnerId) queryClient.invalidateQueries({ queryKey: queryKeys.status.user(partnerId) });
    if (userId) queryClient.invalidateQueries({ queryKey: [...queryKeys.status.all, 'history', userId] });
  }, [queryClient, userId, partnerId]);

  // Mutations
  const setStatusMutation = useMutation({
    mutationFn: async (payload: Omit<SetStatusPayload, 'userId' | 'coupleId' | 'partnerId'>) => {
      if (!userId) throw new Error('User not authenticated');
      return statusService.setStatus({
        ...payload,
        userId,
        coupleId,
        partnerId,
      });
    },
    onMutate: async (newPayload) => {
      if (!userId) return;
      await queryClient.cancelQueries({ queryKey: queryKeys.status.user(userId) });
      const previousStatus = queryClient.getQueryData<StatusUpdate | null>(queryKeys.status.user(userId));

      // Optimistic update
      const optimisticStatus: StatusUpdate = {
        id: `optimistic-${Date.now()}`,
        userId,
        coupleId,
        statusType: newPayload.statusType || 'custom',
        mood: newPayload.mood || '💬',
        statusMessage: newPayload.statusMessage || '',
        customStatus: newPayload.statusMessage || '',
        expiresAt: newPayload.expiresAt || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData(queryKeys.status.user(userId), optimisticStatus);
      return { previousStatus };
    },
    onError: (_err, _newPayload, context) => {
      if (userId && context?.previousStatus !== undefined) {
        queryClient.setQueryData(queryKeys.status.user(userId), context.previousStatus);
      }
    },
    onSettled: () => {
      invalidateStatusQueries();
    },
  });

  const clearStatusMutation = useMutation({
    mutationFn: async (statusId: string) => {
      return statusService.clearStatus(statusId, partnerId, userId);
    },
    onMutate: async () => {
      if (!userId) return;
      await queryClient.cancelQueries({ queryKey: queryKeys.status.user(userId) });
      const previousStatus = queryClient.getQueryData<StatusUpdate | null>(queryKeys.status.user(userId));
      queryClient.setQueryData(queryKeys.status.user(userId), null);
      return { previousStatus };
    },
    onError: (_err, _variables, context) => {
      if (userId && context?.previousStatus !== undefined) {
        queryClient.setQueryData(queryKeys.status.user(userId), context.previousStatus);
      }
    },
    onSettled: () => {
      invalidateStatusQueries();
    },
  });

  const expireStatusMutation = useMutation({
    mutationFn: async (statusId: string) => {
      return statusService.expireStatus(statusId, partnerId, userId);
    },
    onSettled: () => {
      invalidateStatusQueries();
    },
  });

  // Realtime subscription setup
  useEffect(() => {
    if (!userId) return;

    const channelName = `realtime-statuses-${coupleId || userId}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'statuses',
        },
        () => {
          invalidateStatusQueries();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, coupleId, invalidateStatusQueries]);

  // Expiration Check Timer Interval (Checks every 10 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      const current = currentUserStatusQuery.data;
      if (current?.expiresAt) {
        const expiresTime = new Date(current.expiresAt).getTime();
        if (expiresTime <= Date.now()) {
          expireStatusMutation.mutate(current.id);
        }
      }

      const partnerCur = partnerStatusQuery.data;
      if (partnerCur?.expiresAt) {
        const partnerExpiresTime = new Date(partnerCur.expiresAt).getTime();
        if (partnerExpiresTime <= Date.now()) {
          queryClient.invalidateQueries({ queryKey: queryKeys.status.user(partnerId ?? 'partner') });
        }
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [currentUserStatusQuery.data, partnerStatusQuery.data, expireStatusMutation, queryClient, partnerId]);

  // Offline Sync Event Listener
  useEffect(() => {
    const handleOnline = async () => {
      await statusService.processOfflineQueue();
      invalidateStatusQueries();
    };

    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [invalidateStatusQueries]);

  return {
    currentStatus: currentUserStatusQuery.data ?? null,
    isCurrentStatusLoading: currentUserStatusQuery.isLoading,
    partnerStatus: partnerStatusQuery.data ?? null,
    isPartnerStatusLoading: partnerStatusQuery.isLoading,
    statusHistory: statusHistoryQuery.data ?? [],
    isHistoryLoading: statusHistoryQuery.isLoading,
    setStatus: setStatusMutation.mutateAsync,
    isSettingStatus: setStatusMutation.isPending,
    clearStatus: clearStatusMutation.mutateAsync,
    isClearingStatus: clearStatusMutation.isPending,
    expireStatus: expireStatusMutation.mutateAsync,
    refetchStatuses: invalidateStatusQueries,
  };
}
