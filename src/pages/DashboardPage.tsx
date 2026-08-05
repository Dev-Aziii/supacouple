import React from 'react';
import { User as UserIcon, Heart, Send, KeyRound, Calendar, Clock, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/hooks/useSession';
import { useSignOut } from '@/hooks/useSignOut';
import { useCouple } from '@/hooks/useCouple';
import { calculateRelationshipDays, formatAnniversary } from '@/utils/relationship';
import { Button } from '@/components/ui/button';
import { ButtonSpinner } from '@/components/ui/ButtonSpinner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { RelationshipBadge } from '@/components/couple/RelationshipBadge';
import { ROUTES } from '@/constants/routes';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useSession();
  const { mutate: signOut, isPending: isSigningOut } = useSignOut();
  const { couple, partner, relationshipStatus, isLoading: isCoupleLoading } = useCouple();

  const email = user?.email || 'No email';
  const name = profile?.displayName || user?.user_metadata?.display_name || 'User';

  const isPaired = relationshipStatus === 'partnered' && partner;
  const daysTogether = isPaired ? calculateRelationshipDays(couple?.anniversary || couple?.createdAt) : 0;
  const formattedAnniversary = isPaired ? formatAnniversary(couple?.anniversary) : '';

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6 pb-12 animate-in fade-in duration-300">
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

      {/* Main Dashboard Pairing Card */}
      {isCoupleLoading ? (
        <Card className="p-8 text-center">
          <ButtonSpinner />
          <p className="text-xs text-muted-foreground mt-2">Checking relationship status...</p>
        </Card>
      ) : isPaired ? (
        /* PAIRED STATE UI */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Partner Overview Card */}
          <Card className="md:col-span-2 border-rose-500/30 bg-gradient-to-br from-rose-500/5 via-card to-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Heart className="h-5 w-5 text-rose-500 fill-rose-500" />
                  <span>Your Partner</span>
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(ROUTES.PAIR)}
                  className="text-xs border-rose-500/30 text-rose-600 hover:bg-rose-500/10"
                >
                  Manage Pairing
                </Button>
              </div>
              <CardDescription>Connected in your shared couple space</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/40">
                <div className="h-14 w-14 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center font-bold text-xl">
                  {partner?.avatarUrl ? (
                    <img src={partner.avatarUrl} alt={partner.displayName} className="h-full w-full rounded-full object-cover" />
                  ) : (
                    partner?.displayName?.[0]?.toUpperCase() || 'P'
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{partner?.displayName || 'Partner'}</h3>
                  <p className="text-xs text-muted-foreground">{partner?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-muted/40 border border-border/40 flex items-center gap-3">
                  <Clock className="h-6 w-6 text-rose-500" />
                  <div>
                    <span className="text-xs text-muted-foreground">Days Together</span>
                    <p className="text-lg font-extrabold text-foreground">{daysTogether} days</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-muted/40 border border-border/40 flex items-center gap-3">
                  <Calendar className="h-6 w-6 text-purple-500" />
                  <div>
                    <span className="text-xs text-muted-foreground">Anniversary</span>
                    <p className="text-sm font-bold text-foreground">{formattedAnniversary}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Couple Features</CardTitle>
              <CardDescription>Explore your shared tools</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                onClick={() => navigate(ROUTES.PLANS)}
                className="w-full justify-start gap-2 h-11"
              >
                <Calendar className="h-4 w-4 text-rose-500" />
                <span>Shared Calendar & Plans</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate(ROUTES.PROPOSAL)}
                className="w-full justify-start gap-2 h-11"
              >
                <Heart className="h-4 w-4 text-rose-500" />
                <span>Date Proposals</span>
              </Button>
            </CardContent>
          </Card>
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
              Connect with your partner to unlock shared memories, calendars, date proposals, and anniversary tracking.
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
    </div>
  );
};

export default DashboardPage;
