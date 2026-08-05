import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Send,
  KeyRound,
  Calendar,
  Clock,
  LogOut,
  User as UserIcon,
  Sparkles,
  Plus,
  ArrowRight,
  Gift,
  PlusCircle,
} from 'lucide-react';
import { useSession } from '@/hooks/useSession';
import { useSignOut } from '@/hooks/useSignOut';
import { useCouple } from '@/hooks/useCouple';
import { useStatus } from '@/hooks/useStatus';
import { usePlansQuery, useProposalsQuery } from '@/hooks/useSupabaseQueries';
import { calculateRelationshipDays, formatAnniversary } from '@/utils/relationship';
import { Button } from '@/components/ui/button';
import { ButtonSpinner } from '@/components/ui/ButtonSpinner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { RelationshipBadge } from '@/components/couple/RelationshipBadge';
import {
  PartnerStatusCard,
  StatusCard,
  StatusPicker,
  StatusHistory,
} from '@/components/status';
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
  const { mutate: signOut, isPending: isSigningOut } = useSignOut();
  const { couple, partner, relationshipStatus, isLoading: isCoupleLoading } = useCouple();

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

  const coupleId = couple?.id;
  const { data: plans = [], isLoading: isPlansLoading } = usePlansQuery(coupleId);
  const { data: proposals = [], isLoading: isProposalsLoading } = useProposalsQuery(coupleId);

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const email = user?.email || 'No email';
  const name = profile?.displayName || user?.user_metadata?.display_name || 'User';

  const isPaired = relationshipStatus === 'partnered' && partner;
  const daysTogether = isPaired ? calculateRelationshipDays(couple?.anniversary || couple?.createdAt) : 0;
  const formattedAnniversary = isPaired ? formatAnniversary(couple?.anniversary) : '';

  const handleQuickPresetClick = async (preset: PresetStatusConfig) => {
    // 1-hour expiration default for quick preset click
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
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6 pb-16 animate-in fade-in duration-300">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-card border border-border/60 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-center h-16 w-16 rounded-full bg-rose-500/10 border-2 border-rose-500/30 text-rose-500 shadow-md shrink-0">
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={name}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <UserIcon className="h-8 w-8 stroke-[1.5]" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span>Welcome, {name}!</span>
            </h1>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <RelationshipBadge status={relationshipStatus} />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut()}
            disabled={isSigningOut}
            className="text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 gap-1.5"
          >
            {isSigningOut ? <ButtonSpinner /> : <LogOut className="h-4 w-4" />}
            <span>Logout</span>
          </Button>
        </div>
      </div>

      {/* Main Dashboard Pairing Content */}
      {isCoupleLoading ? (
        <Card className="p-8 text-center">
          <ButtonSpinner />
          <p className="text-xs text-muted-foreground mt-2">Checking relationship status...</p>
        </Card>
      ) : isPaired ? (
        /* PAIRED STATE UI - FEATURE RICH LAYOUT */
        <div className="space-y-6">
          {/* SECTION 1: PARTNER CURRENT STATUS (PRIMARY HERO) */}
          <PartnerStatusCard
            partnerName={partner?.displayName || 'Partner'}
            partnerAvatar={partner?.avatarUrl}
            status={partnerStatus}
            isLoading={isPartnerStatusLoading}
          />

          {/* SECTION 2: CURRENT USER STATUS & QUICK PRESETS */}
          <div className="space-y-4">
            {/* Quick Presets Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <span className="text-xs font-bold text-muted-foreground shrink-0 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-rose-500" />
                <span>Quick:</span>
              </span>

              {QUICK_PRESETS.map((preset) => (
                <button
                  key={preset.type}
                  type="button"
                  onClick={() => handleQuickPresetClick(preset)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/60 bg-card hover:bg-rose-500/10 hover:border-rose-500/30 text-xs font-semibold text-foreground transition-all duration-200 shrink-0 shadow-xs hover:scale-[1.03]"
                >
                  <span className="text-sm">{preset.emoji}</span>
                  <span>{preset.label}</span>
                </button>
              ))}

              <button
                type="button"
                onClick={() => setIsPickerOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-xs font-bold text-rose-600 dark:text-rose-400 transition-all duration-200 shrink-0 shadow-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Custom</span>
              </button>
            </div>

            {/* Current User Status Card */}
            <StatusCard
              status={currentStatus}
              isLoading={isCurrentStatusLoading}
              onEdit={() => setIsPickerOpen(true)}
              onDelete={handleDeleteStatus}
              onViewHistory={() => setIsHistoryOpen(true)}
            />
          </div>

          {/* SECTION 3 & 4: TODAY'S PLANS & PENDING PROPOSALS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Today's Plans Card */}
            <Card className="border-border/60 shadow-md">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-rose-500" />
                    <span>Today's Plans</span>
                  </CardTitle>
                  <CardDescription className="text-xs">Upcoming shared events</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(ROUTES.PLANS)}
                  className="text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 gap-1 h-8"
                >
                  <span>View All</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </CardHeader>

              <CardContent className="space-y-3">
                {isPlansLoading ? (
                  <div className="p-3 bg-muted/30 rounded-xl animate-pulse h-16" />
                ) : plans.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-muted/20 border border-dashed border-border text-center space-y-2">
                    <p className="text-xs text-muted-foreground">No plans scheduled for today.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(ROUTES.PLANS)}
                      className="text-xs h-8 gap-1.5"
                    >
                      <PlusCircle className="h-3.5 w-3.5 text-rose-500" />
                      <span>Create Plan</span>
                    </Button>
                  </div>
                ) : (
                  plans.slice(0, 3).map((plan) => (
                    <div
                      key={plan.id}
                      className="p-3 rounded-xl bg-muted/30 border border-border/40 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-foreground truncate">{plan.title}</p>
                        {plan.location && (
                          <p className="text-muted-foreground truncate">{plan.location}</p>
                        )}
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold shrink-0">
                        {new Date(plan.scheduledDate || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Pending Proposals Card */}
            <Card className="border-border/60 shadow-md">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Gift className="h-4 w-4 text-purple-500" />
                    <span>Pending Proposals</span>
                  </CardTitle>
                  <CardDescription className="text-xs">Date ideas waiting for response</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(ROUTES.PROPOSAL)}
                  className="text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 gap-1 h-8"
                >
                  <span>View All</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </CardHeader>

              <CardContent className="space-y-3">
                {isProposalsLoading ? (
                  <div className="p-3 bg-muted/30 rounded-xl animate-pulse h-16" />
                ) : proposals.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-muted/20 border border-dashed border-border text-center space-y-2">
                    <p className="text-xs text-muted-foreground">No pending date proposals.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(ROUTES.PROPOSAL)}
                      className="text-xs h-8 gap-1.5"
                    >
                      <PlusCircle className="h-3.5 w-3.5 text-rose-500" />
                      <span>Propose Date</span>
                    </Button>
                  </div>
                ) : (
                  proposals.slice(0, 3).map((proposal) => (
                    <div
                      key={proposal.id}
                      className="p-3 rounded-xl bg-muted/30 border border-border/40 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-foreground truncate">{proposal.title}</p>
                        <p className="text-muted-foreground truncate">{proposal.description || 'Spontaneous date idea'}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold shrink-0 capitalize">
                        {proposal.status}
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* SECTION 5: RELATIONSHIP SUMMARY & QUICK ACTIONS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Relationship Summary (2 cols) */}
            <Card className="md:col-span-2 border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
                  <span>Relationship Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-muted/40 border border-border/40 flex items-center gap-3">
                    <Clock className="h-6 w-6 text-rose-500" />
                    <div>
                      <span className="text-xs text-muted-foreground">Days Together</span>
                      <p className="text-xl font-extrabold text-foreground">{daysTogether} days</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-muted/40 border border-border/40 flex items-center gap-3">
                    <Calendar className="h-6 w-6 text-purple-500" />
                    <div>
                      <span className="text-xs text-muted-foreground">Anniversary</span>
                      <p className="text-sm font-bold text-foreground">{formattedAnniversary || 'Not set'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions (1 col) */}
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => navigate(ROUTES.PLANS)}
                  className="w-full justify-start gap-2 text-xs h-10"
                >
                  <Calendar className="h-4 w-4 text-rose-500" />
                  <span>Shared Calendar</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => navigate(ROUTES.PROPOSAL)}
                  className="w-full justify-start gap-2 text-xs h-10"
                >
                  <Heart className="h-4 w-4 text-rose-500" />
                  <span>Date Proposals</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* NOT PAIRED STATE UI */
        <Card className="border-rose-500/30 bg-gradient-to-br from-rose-500/5 via-card to-card p-8 text-center space-y-6">
          <div className="mx-auto h-20 w-20 rounded-full bg-rose-500/10 border-2 border-rose-500/30 flex items-center justify-center text-rose-500">
            <Heart className="h-10 w-10 fill-rose-500/20" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-2xl font-bold text-foreground">You are not paired yet</h2>
            <p className="text-sm text-muted-foreground">
              Connect with your partner to unlock live presence, shared status updates, calendars, and date proposals.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <Button
              onClick={() => navigate(ROUTES.PAIR)}
              className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white gap-2 px-6 h-11"
            >
              <Send className="h-4 w-4" />
              <span>Invite Your Partner</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate(ROUTES.PAIR)}
              className="w-full sm:w-auto border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 gap-2 px-6 h-11"
            >
              <KeyRound className="h-4 w-4" />
              <span>Enter Invite Code</span>
            </Button>
          </div>
        </Card>
      )}

      {/* Modals */}
      <StatusPicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelectStatus={handleSelectStatus}
        initialStatus={currentStatus}
        history={statusHistory}
      />

      <StatusHistory
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={statusHistory}
        onReapplyStatus={handleReapplyStatus}
        isLoading={isHistoryLoading}
      />
    </div>
  );
};

export default DashboardPage;
