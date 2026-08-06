import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Sparkles } from 'lucide-react';
import { useSession } from '@/hooks/useSession';
import { useCouple } from '@/hooks/useCouple';
import { useStatus } from '@/hooks/useStatus';
import { useRealtimePlans } from '@/hooks/useRealtimePlans';
import { useRealtimeActivities } from '@/hooks/useRealtimeActivities';
import { useDashboardData } from '@/hooks/useDashboardData';
import { StatusCard, StatusPicker, StatusHistory } from '@/components/status';
import {
  DashboardGreeting,
  PartnerHeroCard,
  TodayPlansCard,
  UpcomingPlansCard,
  DashboardMemoriesCard,
  PendingItemsCard,
  ActivityFeed,
  RelationshipSummary,
  StatisticsCard,
  QuickActions,
} from '@/components/dashboard';
import { RecentNotificationsWidget } from '@/components/dashboard/RecentNotificationsWidget';
import { PRESET_STATUSES, PresetStatusConfig, PresetStatusType } from '@/types/status';
import { ROUTES } from '@/constants/routes';

const QUICK_PRESETS: PresetStatusConfig[] = [
  PRESET_STATUSES.find((p) => p.type === 'working')!,
  PRESET_STATUSES.find((p) => p.type === 'driving')!,
  PRESET_STATUSES.find((p) => p.type === 'at_home')!,
  PRESET_STATUSES.find((p) => p.type === 'eating')!,
  PRESET_STATUSES.find((p) => p.type === 'sleeping')!,
  PRESET_STATUSES.find((p) => p.type === 'gaming')!,
].filter(Boolean);

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useSession();
  const { couple, partner, relationshipStatus } = useCouple();

  const {
    currentStatus,
    isCurrentStatusLoading,
    partnerStatus,
    isPartnerStatusLoading,
    statusHistory,
    isHistoryLoading,
    setStatus,
    clearStatus,
  } = useStatus();

  const { todayPlans, upcomingPlans, isTodayPlansLoading } = useRealtimePlans();
  const {
    groupedActivities,
    isLoading: isActivitiesLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useRealtimeActivities();

  const {
    stats,
    isStatsLoading,
    pendingProposals,
    pendingInvitations,
    unreadNotifications,
  } = useDashboardData();

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const userName = profile?.displayName || user?.user_metadata?.display_name || 'Lovebird';
  const partnerName = partner?.displayName;
  const isPaired = relationshipStatus === 'partnered' && Boolean(partner);

  const handleQuickPresetClick = async (preset: PresetStatusConfig) => {
    const oneHourLater = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    await setStatus({
      statusType: preset.type,
      mood: preset.emoji,
      statusMessage: preset.label,
      expiresAt: oneHourLater,
    });
  };

  const handleSelectStatus = async (payload: {
    statusType?: PresetStatusType;
    mood?: string;
    statusMessage?: string;
    expiresAt?: string | null;
  }) => {
    await setStatus(payload);
  };

  const handleReapplyStatus = async (historicalStatus: {
    statusType?: PresetStatusType;
    mood?: string | null;
    statusMessage?: string | null;
  }) => {
    const oneHourLater = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    await setStatus({
      statusType: historicalStatus.statusType || 'custom',
      mood: historicalStatus.mood || '💬',
      statusMessage: historicalStatus.statusMessage || '',
      expiresAt: oneHourLater,
    });
  };

  const handleDeleteStatus = async () => {
    if (currentStatus?.id) {
      await clearStatus(currentStatus.id);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 pb-20 animate-in fade-in duration-300">
      {/* 1. Header & Dynamic Greeting */}
      <DashboardGreeting
        userName={userName}
        partnerName={partnerName}
        relationshipStatus={relationshipStatus}
        relationshipDays={stats.relationshipDays}
        userAvatar={profile?.avatarUrl}
        partnerAvatar={partner?.avatarUrl}
      />

      {/* 2. Quick Actions Bar */}
      <QuickActions
        onSetStatus={() => setIsPickerOpen(true)}
        onCreatePlan={() => navigate(ROUTES.PLANS)}
        onInvitePartner={() => navigate(ROUTES.PAIR)}
        onCreateProposal={() => navigate(ROUTES.PROPOSAL)}
        onAddMemory={() => navigate(ROUTES.GALLERY)}
        onOpenSettings={() => navigate(ROUTES.SETTINGS)}
        isPaired={isPaired}
        relationshipStatus={relationshipStatus}
      />

      {/* 3. Partner Live Status Hero Card */}
      <PartnerHeroCard
        partnerName={partnerName}
        partnerAvatar={partner?.avatarUrl}
        partnerStatus={partnerStatus}
        isLoading={isPartnerStatusLoading}
        onQuickReply={() => setIsPickerOpen(true)}
        onInvitePartner={() => navigate(ROUTES.PAIR)}
      />

      {/* 4. Current User Status & Presets */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Presets:
          </span>
          {QUICK_PRESETS.map((preset) => (
            <button
              key={preset.type}
              type="button"
              onClick={() => handleQuickPresetClick(preset)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/70 text-xs font-medium text-foreground shrink-0 transition-transform active:scale-95"
            >
              <span>{preset.emoji}</span>
              <span>{preset.label}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setIsPickerOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-primary/30 bg-primary/10 text-xs font-semibold text-primary shrink-0 transition-transform active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            Custom
          </button>
        </div>

        <StatusCard
          status={currentStatus}
          isLoading={isCurrentStatusLoading}
          onEdit={() => setIsPickerOpen(true)}
          onDelete={handleDeleteStatus}
          onViewHistory={() => setIsHistoryOpen(true)}
        />
      </div>

      {/* 5. Pending Items Banner (if any) */}
      <PendingItemsCard
        proposals={pendingProposals}
        invitations={pendingInvitations}
        notifications={unreadNotifications}
        onAcceptProposal={() => navigate(ROUTES.PROPOSAL)}
        onDeclineProposal={() => navigate(ROUTES.PROPOSAL)}
      />

      {/* 6. Main Dashboard Grid Layout (Desktop Two-Column) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Main Column: Schedule, Upcoming Plans & Shared Stats */}
        <div className="lg:col-span-7 space-y-6">
          <TodayPlansCard
            todayPlans={todayPlans}
            isLoading={isTodayPlansLoading}
            onCreatePlan={() => navigate(ROUTES.PLANS)}
            onViewAllPlans={() => navigate(ROUTES.PLANS)}
          />

          <UpcomingPlansCard
            upcomingPlans={upcomingPlans}
            onViewCalendar={() => navigate(ROUTES.CALENDAR)}
          />

          <DashboardMemoriesCard
            coupleId={couple?.id}
            onAddMemory={() => navigate(ROUTES.GALLERY)}
          />

          <StatisticsCard stats={stats} isLoading={isStatsLoading} />
        </div>

        {/* Right Column: Activity Feed, Recent Notifications & Relationship Summary */}
        <div className="lg:col-span-5 space-y-6">
          <RecentNotificationsWidget />

          <RelationshipSummary
            partnerName={partnerName}
            partnerAvatar={partner?.avatarUrl}
            anniversary={couple?.anniversary}
            daysTogether={stats.relationshipDays}
          />

          <ActivityFeed
            groupedActivities={groupedActivities}
            isLoading={isActivitiesLoading}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            onFetchNextPage={fetchNextPage}
          />
        </div>
      </div>

      {/* Modals */}
      <StatusPicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelectStatus={handleSelectStatus}
      />

      <StatusHistory
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={statusHistory}
        isLoading={isHistoryLoading}
        onReapplyStatus={(status) =>
          handleReapplyStatus({
            statusType: status.statusType,
            mood: status.mood,
            statusMessage: status.statusMessage,
          })
        }
      />
    </div>
  );
};
