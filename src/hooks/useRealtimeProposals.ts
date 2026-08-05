import { useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { proposalService } from '../services/proposals/proposalService';
import { proposalRepository } from '../services/repositories/proposalRepository';
import type {
  CreateProposalDTO,
  UpdateProposalDTO,
  CounterProposalDTO,
  SpontaneousProposal,
} from '../types/proposal';
import { queryKeys } from '../constants/queryKeys';
import { supabase } from '../services/supabase/client';
import { useSession } from './useSession';
import { useCouple } from './useCouple';

export function useRealtimeProposals() {
  const queryClient = useQueryClient();
  const { user } = useSession();
  const { partner, couple } = useCouple();

  const userId = user?.id;
  const partnerId = partner?.id;
  const coupleId = couple?.id;

  const invalidateProposals = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.proposals.all });
  }, [queryClient]);

  // 1. All proposals query for couple
  const proposalsQuery = useQuery<SpontaneousProposal[]>({
    queryKey: [...queryKeys.proposals.lists(), coupleId ?? 'none'],
    queryFn: async () => {
      if (!coupleId) return [];
      return proposalRepository.getByCoupleId(coupleId);
    },
    enabled: Boolean(coupleId),
    staleTime: 1000 * 15,
  });

  // 2. Upcoming proposals query
  const upcomingQuery = useQuery<SpontaneousProposal[]>({
    queryKey: ['proposals', 'upcoming', coupleId ?? 'none'],
    queryFn: async () => {
      if (!coupleId) return [];
      return proposalRepository.getUpcoming(coupleId);
    },
    enabled: Boolean(coupleId),
    staleTime: 1000 * 15,
  });

  // 3. Partner pending proposals query
  const partnerPendingQuery = useQuery<SpontaneousProposal[]>({
    queryKey: ['proposals', 'partner-pending', coupleId ?? 'none', userId ?? 'none'],
    queryFn: async () => {
      if (!coupleId || !userId) return [];
      return proposalRepository.getPartnerPending(coupleId, userId);
    },
    enabled: Boolean(coupleId && userId),
    staleTime: 1000 * 15,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (dto: Omit<CreateProposalDTO, 'coupleId' | 'senderId'>) => {
      if (!coupleId || !userId) throw new Error('Couple or user missing');
      return proposalService.createProposal(
        {
          ...dto,
          coupleId,
          senderId: userId,
        },
        partnerId
      );
    },
    onSettled: () => invalidateProposals(),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateProposalDTO }) => {
      return proposalService.editProposal(id, updates, partnerId, userId);
    },
    onSettled: () => invalidateProposals(),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return proposalService.deleteProposal(id, partnerId, userId);
    },
    onSettled: () => invalidateProposals(),
  });

  const acceptMutation = useMutation({
    mutationFn: async ({ id, note }: { id: string; note?: string }) => {
      return proposalService.acceptProposal(id, note, partnerId, userId);
    },
    onSettled: () => {
      invalidateProposals();
      queryClient.invalidateQueries({ queryKey: queryKeys.plans.all });
    },
  });

  const declineMutation = useMutation({
    mutationFn: async ({ id, note }: { id: string; note?: string }) => {
      return proposalService.declineProposal(id, note, partnerId, userId);
    },
    onSettled: () => invalidateProposals(),
  });

  const maybeMutation = useMutation({
    mutationFn: async ({ id, note }: { id: string; note?: string }) => {
      return proposalService.maybeProposal(id, note, partnerId, userId);
    },
    onSettled: () => invalidateProposals(),
  });

  const counterMutation = useMutation({
    mutationFn: async (dto: Omit<CounterProposalDTO, 'coupleId' | 'senderId'>) => {
      if (!coupleId || !userId) throw new Error('Couple or user missing');
      return proposalService.counterProposal(
        {
          ...dto,
          coupleId,
          senderId: userId,
        },
        partnerId
      );
    },
    onSettled: () => invalidateProposals(),
  });

  const completeMutation = useMutation({
    mutationFn: async (id: string) => {
      return proposalService.completeProposal(id, partnerId, userId);
    },
    onSettled: () => invalidateProposals(),
  });

  // Realtime Subscriptions for `proposals`, `proposal_comments`, `proposal_reactions`
  useEffect(() => {
    if (!coupleId) return;

    const proposalsChannel = supabase
      .channel(`realtime_proposals_${coupleId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'proposals',
          filter: `couple_id=eq.${coupleId}`,
        },
        () => {
          invalidateProposals();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'proposal_comments',
        },
        () => {
          invalidateProposals();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'proposal_reactions',
        },
        () => {
          invalidateProposals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(proposalsChannel);
    };
  }, [coupleId, invalidateProposals]);

  // Offline listener
  useEffect(() => {
    const handleOnline = async () => {
      await proposalService.processOfflineQueue();
      invalidateProposals();
    };

    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [invalidateProposals]);

  return {
    proposals: proposalsQuery.data ?? [],
    isLoading: proposalsQuery.isLoading,
    upcomingProposals: upcomingQuery.data ?? [],
    isUpcomingLoading: upcomingQuery.isLoading,
    partnerPendingProposals: partnerPendingQuery.data ?? [],
    isPartnerPendingLoading: partnerPendingQuery.isLoading,
    createProposal: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateProposal: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteProposal: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    acceptProposal: acceptMutation.mutateAsync,
    isAccepting: acceptMutation.isPending,
    declineProposal: declineMutation.mutateAsync,
    isDeclining: declineMutation.isPending,
    maybeProposal: maybeMutation.mutateAsync,
    isMaybeing: maybeMutation.isPending,
    counterProposal: counterMutation.mutateAsync,
    isCountering: counterMutation.isPending,
    completeProposal: completeMutation.mutateAsync,
    isCompleting: completeMutation.isPending,
    refetchProposals: invalidateProposals,
  };
}
