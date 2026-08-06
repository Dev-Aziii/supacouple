import { useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { planService } from '../services/plans/planService';
import type { CreatePlanDTO, UpdatePlanDTO } from '../services/repositories/plansRepository';
import { queryKeys } from '../constants/queryKeys';
import { supabase } from '../services/supabase/client';
import { useSession } from './useSession';
import { useCouple } from './useCouple';
import type { PlanItem } from '../types/plan';

export interface UseRealtimePlansOptions {
  year?: number;
  month?: number; // 0-indexed (0 = Jan, 7 = Aug)
}

export function useRealtimePlans(options?: UseRealtimePlansOptions) {
  const queryClient = useQueryClient();
  const { user } = useSession();
  const { partner, couple } = useCouple();

  const userId = user?.id;
  const partnerId = partner?.id;
  const coupleId = couple?.id;

  const currentYear = options?.year ?? new Date().getFullYear();
  const currentMonth = options?.month ?? new Date().getMonth();

  // Helper to invalidate all plan queries
  const invalidatePlanQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.plans.all });
  }, [queryClient]);

  // 1. Month Plans Query
  const monthPlansQuery = useQuery<PlanItem[]>({
    queryKey: queryKeys.plans.month(coupleId ?? 'none', currentYear, currentMonth),
    queryFn: async () => {
      if (!coupleId) return [];
      return planService.getPlansByMonth(coupleId, currentYear, currentMonth);
    },
    enabled: Boolean(coupleId),
    staleTime: 1000 * 30,
  });

  // 2. Upcoming Plans Query
  const upcomingPlansQuery = useQuery<PlanItem[]>({
    queryKey: queryKeys.plans.upcoming(coupleId ?? 'none'),
    queryFn: async () => {
      if (!coupleId) return [];
      return planService.getUpcomingPlans(coupleId, 20);
    },
    enabled: Boolean(coupleId),
    staleTime: 1000 * 30,
  });

  // 3. Today Plans Query
  const todayPlansQuery = useQuery<PlanItem[]>({
    queryKey: queryKeys.plans.today(coupleId ?? 'none'),
    queryFn: async () => {
      if (!coupleId) return [];
      return planService.getTodayPlans(coupleId);
    },
    enabled: Boolean(coupleId),
    staleTime: 1000 * 30,
  });

  // Mutations
  const createPlanMutation = useMutation({
    mutationFn: async (dto: Omit<CreatePlanDTO, 'coupleId' | 'createdBy'>) => {
      if (!coupleId || !userId) throw new Error('Couple or user missing');
      return planService.createPlan(
        {
          ...dto,
          coupleId,
          createdBy: userId,
        },
        partnerId
      );
    },
    onSettled: () => {
      invalidatePlanQueries();
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdatePlanDTO }) => {
      return planService.updatePlan(id, updates, partnerId, userId);
    },
    onSettled: () => {
      invalidatePlanQueries();
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: async (id: string) => {
      return planService.deletePlan(id, partnerId, userId);
    },
    onSettled: () => {
      invalidatePlanQueries();
    },
  });

  const completePlanMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      return planService.completePlan(id, completed, partnerId, userId);
    },
    onSettled: () => {
      invalidatePlanQueries();
    },
  });

  // Realtime Subscription on `plans` table for coupleId
  useEffect(() => {
    if (!coupleId) return;

    const channelName = `plans_realtime_${coupleId}_${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'plans',
          filter: `couple_id=eq.${coupleId}`,
        },
        () => {
          invalidatePlanQueries();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [coupleId, invalidatePlanQueries]);

  // Offline Sync Event Listener
  useEffect(() => {
    const handleOnline = async () => {
      await planService.processOfflineQueue();
      invalidatePlanQueries();
    };

    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [invalidatePlanQueries]);

  return {
    monthPlans: monthPlansQuery.data ?? [],
    isMonthPlansLoading: monthPlansQuery.isLoading,
    upcomingPlans: upcomingPlansQuery.data ?? [],
    isUpcomingPlansLoading: upcomingPlansQuery.isLoading,
    todayPlans: todayPlansQuery.data ?? [],
    isTodayPlansLoading: todayPlansQuery.isLoading,
    createPlan: createPlanMutation.mutateAsync,
    isCreatingPlan: createPlanMutation.isPending,
    updatePlan: updatePlanMutation.mutateAsync,
    isUpdatingPlan: updatePlanMutation.isPending,
    deletePlan: deletePlanMutation.mutateAsync,
    isDeletingPlan: deletePlanMutation.isPending,
    completePlan: completePlanMutation.mutateAsync,
    isCompletingPlan: completePlanMutation.isPending,
    refetchPlans: invalidatePlanQueries,
  };
}
