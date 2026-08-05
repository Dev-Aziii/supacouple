import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../constants/queryKeys';
import { useCouple } from './useCouple';
import { useSession } from './useSession';
import { plansRepository } from '../services/repositories/plansRepository';
import { proposalRepository } from '../services/repositories/proposalRepository';
import { invitationsRepository } from '../services/repositories/invitationsRepository';
import { notificationRepository } from '../services/repositories/notificationRepository';
import { statusRepository } from '../services/repositories/statusRepository';
import { calculateRelationshipDays } from '../utils/relationship';
import type { PlanItem } from '../types/plan';
import type { StatusUpdate } from '../types/status';
import type { SpontaneousProposal } from '../types/proposal';
import type { NotificationItem } from '../services/repositories/notificationRepository';

export interface DashboardStats {
  relationshipDays: number;
  plansCompletedTotal: number;
  plansThisMonth: number;
  currentStreak: number;
  statusesUpdatedTotal: number;
  upcomingEventsCount: number;
}

export function useDashboardData() {
  const { couple, partner } = useCouple();
  const { user } = useSession();

  const coupleId = couple?.id;
  const userId = user?.id;

  const statsQuery = useQuery<DashboardStats>({
    queryKey: queryKeys.dashboard.stats(coupleId ?? 'none'),
    queryFn: async () => {
      if (!coupleId) {
        return {
          relationshipDays: 0,
          plansCompletedTotal: 0,
          plansThisMonth: 0,
          currentStreak: 0,
          statusesUpdatedTotal: 0,
          upcomingEventsCount: 0,
        };
      }

      const relationshipDays = calculateRelationshipDays(couple.anniversary || couple.createdAt);

      const [allPlans, allStatuses] = await Promise.all([
        plansRepository.getByCoupleId(coupleId),
        userId ? statusRepository.getStatusHistory(userId) : Promise.resolve([]),
      ]);

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const completedPlans = allPlans.filter((p: PlanItem) => p.completed);
      const plansCompletedTotal = completedPlans.length;

      const plansThisMonth = allPlans.filter((p: PlanItem) => {
        const d = new Date(p.startAt);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      }).length;

      const upcomingEventsCount = allPlans.filter((p: PlanItem) => {
        const d = new Date(p.startAt);
        return d > now && !p.completed;
      }).length;

      const statusesUpdatedTotal = allStatuses.length;

      // Calculate simple active streak based on consecutive days with status updates
      let streak = 0;
      if (allStatuses.length > 0) {
        const sortedDates = Array.from(
          new Set(
            allStatuses.map((s: StatusUpdate) =>
              s.createdAt ? new Date(s.createdAt).toISOString().split('T')[0] : ''
            ).filter(Boolean)
          )
        ).sort((a: string, b: string) => (a < b ? 1 : -1));

        const todayStr = new Date().toISOString().split('T')[0];
        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

        const checkDateStr = sortedDates.includes(todayStr)
          ? todayStr
          : sortedDates.includes(yesterdayStr)
          ? yesterdayStr
          : null;

        if (checkDateStr) {
          const curr = new Date(checkDateStr);
          while (true) {
            const dateIso = curr.toISOString().split('T')[0];
            if (sortedDates.includes(dateIso)) {
              streak++;
              curr.setDate(curr.getDate() - 1);
            } else {
              break;
            }
          }
        }
      }

      return {
        relationshipDays,
        plansCompletedTotal,
        plansThisMonth,
        currentStreak: streak || 1,
        statusesUpdatedTotal,
        upcomingEventsCount,
      };
    },
    enabled: Boolean(coupleId),
    staleTime: 1000 * 60 * 2,
  });

  const pendingProposalsQuery = useQuery<SpontaneousProposal[]>({
    queryKey: ['dashboard', 'pending-proposals', coupleId],
    queryFn: async () => {
      if (!coupleId) return [];
      const proposals = await proposalRepository.getByCoupleId(coupleId);
      return proposals.filter((p) => p.status === 'pending');
    },
    enabled: Boolean(coupleId),
  });

  const pendingInvitationsQuery = useQuery({
    queryKey: ['dashboard', 'pending-invitations', userId],
    queryFn: async () => {
      if (!userId || !user?.email) return [];
      return invitationsRepository.getPendingForUser(user.email, userId);
    },
    enabled: Boolean(userId),
  });

  const unreadNotificationsQuery = useQuery<NotificationItem[]>({
    queryKey: ['dashboard', 'unread-notifications', userId],
    queryFn: async () => {
      if (!userId) return [];
      const notifs = await notificationRepository.getByRecipientId(userId);
      return notifs.filter((n) => !n.read);
    },
    enabled: Boolean(userId),
  });

  return {
    stats: statsQuery.data ?? {
      relationshipDays: calculateRelationshipDays(couple?.anniversary || couple?.createdAt),
      plansCompletedTotal: 0,
      plansThisMonth: 0,
      currentStreak: 1,
      statusesUpdatedTotal: 0,
      upcomingEventsCount: 0,
    },
    isStatsLoading: statsQuery.isLoading,
    pendingProposals: pendingProposalsQuery.data ?? [],
    isPendingProposalsLoading: pendingProposalsQuery.isLoading,
    pendingInvitations: pendingInvitationsQuery.data ?? [],
    isPendingInvitationsLoading: pendingInvitationsQuery.isLoading,
    unreadNotifications: unreadNotificationsQuery.data ?? [],
    isUnreadNotificationsLoading: unreadNotificationsQuery.isLoading,
    partner,
    couple,
  };
}
