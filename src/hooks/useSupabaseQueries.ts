import { useQuery, useMutation, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { queryKeys } from '../constants/queryKeys';
import { UserProfile } from '../types/user';
import { StatusUpdate } from '../types/status';
import { PlanItem } from '../types/plan';
import { SpontaneousProposal } from '../types/proposal';
import { MemoryItem } from '../types/memory';
import { plansRepository } from '../services/repositories/plansRepository';
import { proposalRepository } from '../services/repositories/proposalRepository';

// Placeholder hook for Auth Query
export function useAuthQuery(): UseQueryResult<{ id: string; email: string } | null, Error> {
  return useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: async () => {
      // Placeholder - no implementation yet
      return null;
    },
    enabled: false,
  });
}

// Placeholder hook for User Profile Query
export function useProfileQuery(userId?: string): UseQueryResult<UserProfile | null, Error> {
  return useQuery({
    queryKey: queryKeys.profile.detail(userId ?? 'me'),
    queryFn: async () => {
      // Placeholder - no implementation yet
      return null;
    },
    enabled: Boolean(userId),
  });
}

// Placeholder hook for Status Query
export function useStatusQuery(userId?: string): UseQueryResult<StatusUpdate | null, Error> {
  return useQuery({
    queryKey: queryKeys.status.user(userId ?? 'me'),
    queryFn: async () => {
      // Placeholder - no implementation yet
      return null;
    },
    enabled: Boolean(userId),
  });
}

// Real hook for Plans Query
export function usePlansQuery(coupleId?: string): UseQueryResult<PlanItem[], Error> {
  return useQuery({
    queryKey: [...queryKeys.plans.lists(), coupleId ?? 'none'],
    queryFn: async () => {
      if (!coupleId) return [];
      return plansRepository.getByCoupleId(coupleId);
    },
    enabled: Boolean(coupleId),
  });
}

// Real hook for Proposals Query
export function useProposalsQuery(coupleId?: string): UseQueryResult<SpontaneousProposal[], Error> {
  return useQuery({
    queryKey: [...queryKeys.proposals.lists(), coupleId ?? 'none'],
    queryFn: async () => {
      if (!coupleId) return [];
      return proposalRepository.getByCoupleId(coupleId);
    },
    enabled: Boolean(coupleId),
  });
}

// Placeholder hook for Memories Query
export function useMemoriesQuery(): UseQueryResult<MemoryItem[], Error> {
  return useQuery({
    queryKey: queryKeys.memories.lists(),
    queryFn: async () => {
      // Placeholder - no implementation yet
      return [];
    },
    enabled: false,
  });
}

// Placeholder hook for Settings Query
export function useSettingsQuery(userId?: string): UseQueryResult<Record<string, unknown> | null, Error> {
  return useQuery({
    queryKey: queryKeys.settings.user(userId ?? 'me'),
    queryFn: async () => {
      // Placeholder - no implementation yet
      return null;
    },
    enabled: Boolean(userId),
  });
}

// Placeholder mutation hook for creating plans
export function useCreatePlanMutation(): UseMutationResult<PlanItem, Error, Omit<PlanItem, 'id' | 'createdAt' | 'updatedAt'>> {
  return useMutation({
    mutationFn: async () => {
      throw new Error('Placeholder mutation - not implemented yet');
    },
  });
}
