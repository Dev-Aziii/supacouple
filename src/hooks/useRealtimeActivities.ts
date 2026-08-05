import { useEffect, useCallback } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { activityService } from '../services/activity/activityService';
import { queryKeys } from '../constants/queryKeys';
import { supabase } from '../services/supabase/client';
import { useCouple } from './useCouple';
import type { ActivityItem } from '../types/activity';

export function useRealtimeActivities() {
  const queryClient = useQueryClient();
  const { couple } = useCouple();
  const coupleId = couple?.id;

  const queryKey = queryKeys.activities.feed(coupleId ?? 'none');

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 1 }) => {
      if (!coupleId) return { data: [], hasMore: false, page: 1 };
      return activityService.getActivityFeed(coupleId, pageParam, 15);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
    enabled: Boolean(coupleId),
    staleTime: 1000 * 60,
  });

  const invalidateFeed = useCallback(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  useEffect(() => {
    if (!coupleId) return;

    const channel = supabase
      .channel(`realtime:activities:${coupleId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activities',
          filter: `couple_id=eq.${coupleId}`,
        },
        () => {
          invalidateFeed();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [coupleId, invalidateFeed]);

  const allActivities: ActivityItem[] = data
    ? data.pages.flatMap((page) => page.data)
    : [];

  const groupedActivities = activityService.groupActivities(allActivities);

  return {
    activities: allActivities,
    groupedActivities,
    isLoading,
    isError,
    error,
    hasNextPage: Boolean(hasNextPage),
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  };
}
