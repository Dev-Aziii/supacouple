import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRelationshipStore } from '../store/relationshipStore';
import { coupleService } from '../services/couple/coupleService';
import { useSession } from './useSession';

export const QUERY_KEYS = {
  COUPLE: ['couple'],
  PARTNER: ['partner'],
  INVITATIONS: ['invitations'],
  PENDING_INVITES: ['pending_invitations'],
};

/**
 * Hook to access current couple data and trigger automatic realtime sync.
 */
export function useCouple() {
  const { user } = useSession();
  const {
    currentCouple,
    partner,
    relationshipStatus,
    isLoading,
    isInitialized,
    fetchRelationship,
    subscribeToRealtime,
    unsubscribeRealtime,
  } = useRelationshipStore();

  useEffect(() => {
    if (user?.id) {
      fetchRelationship();
      subscribeToRealtime(user.id);
    } else {
      unsubscribeRealtime();
    }
  }, [user?.id, fetchRelationship, subscribeToRealtime, unsubscribeRealtime]);

  return {
    couple: currentCouple,
    partner,
    relationshipStatus,
    isLoading: isLoading || !isInitialized,
    refetch: fetchRelationship,
  };
}

/**
 * Hook to access partner profile specifically.
 */
export function usePartner() {
  const { partner, relationshipStatus, isLoading } = useRelationshipStore();
  return {
    partner,
    isPartnered: relationshipStatus === 'partnered',
    isLoading,
  };
}

/**
 * Hook to fetch and validate a specific invite code.
 */
export function useInvitation(code?: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.INVITATIONS, code],
    queryFn: () => (code ? coupleService.validateInvite(code) : null),
    enabled: Boolean(code && code.trim().length >= 6),
  });
}

/**
 * Hook to access all pending sent & received invitations.
 */
export function usePendingInvites() {
  const { pendingSent, pendingReceived, isLoading, fetchRelationship } = useRelationshipStore();

  return {
    sent: pendingSent,
    received: pendingReceived,
    isLoading,
    refetch: fetchRelationship,
  };
}

/**
 * Mutation hook to create an invitation.
 */
export function useCreateInvite() {
  const queryClient = useQueryClient();
  const fetchRelationship = useRelationshipStore((state) => state.fetchRelationship);

  return useMutation({
    mutationFn: ({ email, anniversary }: { email: string; anniversary?: string }) =>
      coupleService.createInvite(email, anniversary),
    onSuccess: async () => {
      await fetchRelationship();
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PENDING_INVITES });
    },
  });
}

/**
 * Mutation hook to accept an invitation code.
 */
export function useAcceptInvite() {
  const queryClient = useQueryClient();
  const fetchRelationship = useRelationshipStore((state) => state.fetchRelationship);

  return useMutation({
    mutationFn: ({ code, anniversary }: { code: string; anniversary?: string }) =>
      coupleService.acceptInvite(code, anniversary),
    onSuccess: async () => {
      await fetchRelationship();
      queryClient.invalidateQueries();
    },
  });
}

/**
 * Mutation hook to decline an invitation.
 */
export function useDeclineInvite() {
  const queryClient = useQueryClient();
  const fetchRelationship = useRelationshipStore((state) => state.fetchRelationship);

  return useMutation({
    mutationFn: (invitationId: string) => coupleService.declineInvite(invitationId),
    onSuccess: async () => {
      await fetchRelationship();
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PENDING_INVITES });
    },
  });
}

/**
 * Mutation hook to cancel a sent invitation.
 */
export function useCancelInvite() {
  const queryClient = useQueryClient();
  const fetchRelationship = useRelationshipStore((state) => state.fetchRelationship);

  return useMutation({
    mutationFn: (invitationId: string) => coupleService.cancelInvite(invitationId),
    onSuccess: async () => {
      await fetchRelationship();
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PENDING_INVITES });
    },
  });
}

/**
 * Mutation hook to leave current relationship.
 */
export function useLeaveRelationship() {
  const queryClient = useQueryClient();
  const fetchRelationship = useRelationshipStore((state) => state.fetchRelationship);

  return useMutation({
    mutationFn: () => coupleService.leaveRelationship(),
    onSuccess: async () => {
      await fetchRelationship();
      queryClient.invalidateQueries();
    },
  });
}
