import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Heart,
  Settings,
  Calendar,
  Sparkles,
  Camera,
  Send,
  ArrowRight,
  ShieldCheck,
  UserPlus,
  Clock,
  Quote,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FullScreenLoader } from '@/components/ui/FullScreenLoader';
import { useSession } from '@/hooks/useSession';
import { useCouple, usePendingInvites } from '@/hooks/useCouple';
import { useSettings } from '@/hooks/useSettings';
import { usePlansQuery, useProposalsQuery } from '@/hooks/useSupabaseQueries';
import { useMemories } from '@/hooks/useMemories';
import { ROUTES } from '@/constants/routes';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, user } = useSession();
  const { couple, partner, relationshipStatus, isLoading: isCoupleLoading } = useCouple();
  const { profilePreferences, settings } = useSettings();
  const { sent } = usePendingInvites();

  const { data: plans } = usePlansQuery(couple?.id);
  const { data: proposals } = useProposalsQuery(couple?.id);
  const { data: memories } = useMemories(couple?.id);

  if (isCoupleLoading) {
    return <FullScreenLoader message="Loading profile & relationship details..." />;
  }

  const userName = profile?.displayName || user?.user_metadata?.display_name || 'User';
  const avatarUrl = profile?.avatarUrl;
  const userEmail = user?.email || 'No email registered';
  const bio = profilePreferences?.bio || '';
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        month: 'short',
        year: 'numeric',
      })
    : null;

  const isPartnered = relationshipStatus === 'partnered' && partner;
  const activeSentInvite = sent.length > 0 ? sent[0] : null;

  // Days together calculation
  const daysTogether = couple?.createdAt
    ? Math.max(1, Math.floor((Date.now() - new Date(couple.createdAt).getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
              <User className="w-7 h-7" />
            </div>
            <span>Profile & Pair Hub</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your personal profile showcase, partner connection, and shared couple journey
          </p>
        </div>

        <Button
          onClick={() => navigate(ROUTES.SETTINGS)}
          variant="outline"
          className="rounded-xl border-border/60 gap-2 shrink-0 self-start sm:self-auto shadow-sm hover:bg-accent"
        >
          <Settings className="w-4 h-4 text-muted-foreground" />
          <span>Edit Profile Settings</span>
        </Button>
      </div>

      {/* Main Grid: Personal Profile Hero + Relationship Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Personal Profile Card */}
        <Card className="border-border/60 shadow-sm bg-card/80 backdrop-blur-sm flex flex-col justify-between">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                <span>My Personal Profile</span>
              </CardTitle>
              {memberSince && (
                <span className="text-[11px] font-semibold text-muted-foreground px-2.5 py-1 rounded-full bg-secondary border border-border/40">
                  Member since {memberSince}
                </span>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Avatar & User Info */}
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-secondary border-2 border-primary/40 flex items-center justify-center shadow-md">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-full border-2 border-background" title="Account Active" />
              </div>

              <div className="overflow-hidden">
                <h2 className="text-xl font-bold text-foreground truncate">{userName}</h2>
                <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <Clock className="w-3 h-3" />
                    {settings?.timezone || 'UTC'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bio Box */}
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/40 relative">
              <Quote className="w-4 h-4 text-pink-500/40 absolute top-3 left-3" />
              <p className="text-xs italic text-foreground/90 pl-5 leading-relaxed">
                {bio ? bio : 'No bio set yet. Click "Edit Profile Settings" to write a message for your partner!'}
              </p>
            </div>
          </CardContent>

          <div className="p-4 pt-0">
            <Button
              onClick={() => navigate(ROUTES.SETTINGS)}
              variant="secondary"
              className="w-full rounded-xl text-xs font-semibold gap-2 border border-border/40"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Customize Profile & Avatar</span>
            </Button>
          </div>
        </Card>

        {/* 2. Couple & Pair Status Card */}
        <Card className="border-pink-500/20 shadow-sm bg-gradient-to-b from-card to-pink-500/5 backdrop-blur-sm flex flex-col justify-between">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500 fill-pink-500/20" />
                <span>Pair Connection</span>
              </CardTitle>

              <span
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                  isPartnered
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}
              >
                {isPartnered ? 'Partnered 💕' : activeSentInvite ? 'Invite Sent ⏳' : 'Single / Un-paired'}
              </span>
            </div>
            <CardDescription>Partner connection status and relationship counter</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {isPartnered && partner ? (
              <div className="space-y-4">
                {/* Connected Partner Details */}
                <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-card border border-pink-500/20 shadow-xs">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-secondary border-2 border-pink-500/40 flex items-center justify-center shrink-0">
                    {partner.avatarUrl ? (
                      <img src={partner.avatarUrl} alt={partner.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-7 h-7 text-muted-foreground" />
                    )}
                  </div>

                  <div className="overflow-hidden flex-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-pink-400">Connected Partner</span>
                    <h3 className="text-lg font-bold text-foreground truncate">{partner.displayName}</h3>
                    <p className="text-xs text-muted-foreground truncate">{partner.email}</p>
                  </div>
                </div>

                {/* Days Together & Details */}
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 rounded-2xl bg-pink-500/10 border border-pink-500/20">
                    <span className="text-xs text-muted-foreground">Days Together</span>
                    <p className="text-2xl font-extrabold text-pink-500">{daysTogether} Days</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                    <span className="text-xs text-muted-foreground">Anniversary</span>
                    <p className="text-xs font-bold text-foreground mt-1 truncate">
                      {couple?.anniversary
                        ? new Date(couple.anniversary).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'Set in settings'}
                    </p>
                  </div>
                </div>
              </div>
            ) : activeSentInvite ? (
              <div className="p-5 rounded-2xl bg-muted/40 border border-border/40 text-center space-y-3">
                <ShieldCheck className="w-8 h-8 text-amber-400 mx-auto" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Invitation Sent to Partner</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Sent to: <strong className="text-foreground">{activeSentInvite.email}</strong>
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-muted/40 border border-border/40 text-center space-y-3">
                <UserPlus className="w-8 h-8 text-pink-400 mx-auto animate-pulse" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Connect with your Partner</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Send an invite or enter an 8-character invitation code to start sharing memories and plans.
                  </p>
                </div>
              </div>
            )}
          </CardContent>

          <div className="p-4 pt-0">
            <Button
              onClick={() => navigate(ROUTES.PAIR)}
              className="w-full rounded-xl text-xs font-semibold gap-2 bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
            >
              <Heart className="w-3.5 h-3.5 fill-white" />
              <span>{isPartnered ? 'Manage Pair Connection & Unpair' : 'Go to Pairing Workspace'}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-auto" />
            </Button>
          </div>
        </Card>
      </div>

      {/* 3. Shared Activity Highlights */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>Couple Highlights & Modules</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Memories Summary Card */}
          <Card
            onClick={() => navigate(ROUTES.MEMORIES)}
            className="border-border/60 hover:border-pink-500/50 cursor-pointer transition-all duration-200 hover:shadow-md bg-card/80 backdrop-blur-sm group"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-400 group-hover:bg-pink-500 group-hover:text-white transition-colors">
                  <Camera className="w-5 h-5" />
                </div>
                <span className="text-2xl font-extrabold text-foreground">{memories ? memories.length : 0}</span>
              </div>
              <CardTitle className="text-base mt-2">Memories</CardTitle>
              <CardDescription className="text-xs">Photo gallery & timeline milestones</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <span className="text-xs text-pink-400 group-hover:underline flex items-center gap-1 font-semibold mt-2">
                <span>View Memories</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </CardContent>
          </Card>

          {/* Plans Summary Card */}
          <Card
            onClick={() => navigate(ROUTES.PLANS)}
            className="border-border/60 hover:border-purple-500/50 cursor-pointer transition-all duration-200 hover:shadow-md bg-card/80 backdrop-blur-sm group"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className="text-2xl font-extrabold text-foreground">{plans ? plans.length : 0}</span>
              </div>
              <CardTitle className="text-base mt-2">Plans & Dates</CardTitle>
              <CardDescription className="text-xs">Upcoming dates & couple calendar</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <span className="text-xs text-purple-400 group-hover:underline flex items-center gap-1 font-semibold mt-2">
                <span>View Plans</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </CardContent>
          </Card>

          {/* Proposals Summary Card */}
          <Card
            onClick={() => navigate(ROUTES.PROPOSAL)}
            className="border-border/60 hover:border-amber-500/50 cursor-pointer transition-all duration-200 hover:shadow-md bg-card/80 backdrop-blur-sm group"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                  <Send className="w-5 h-5" />
                </div>
                <span className="text-2xl font-extrabold text-foreground">{proposals ? proposals.length : 0}</span>
              </div>
              <CardTitle className="text-base mt-2">Proposals</CardTitle>
              <CardDescription className="text-xs">Spontaneous ideas & activity invites</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <span className="text-xs text-amber-400 group-hover:underline flex items-center gap-1 font-semibold mt-2">
                <span>View Proposals</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

