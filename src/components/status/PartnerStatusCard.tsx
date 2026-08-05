import React from 'react';
import { StatusUpdate } from '@/types/status';
import { StatusChip } from './StatusChip';
import { StatusTimer } from './StatusTimer';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, User as UserIcon, Activity } from 'lucide-react';
import { cn } from '@/utils/cn';

interface PartnerStatusCardProps {
  partnerName?: string;
  partnerAvatar?: string | null;
  status: StatusUpdate | null;
  isLoading?: boolean;
  className?: string;
}

export const PartnerStatusCard: React.FC<PartnerStatusCardProps> = ({
  partnerName = 'Partner',
  partnerAvatar,
  status,
  isLoading = false,
  className,
}) => {
  return (
    <Card className={cn('relative overflow-hidden border-rose-500/30 bg-gradient-to-br from-rose-500/10 via-card to-card shadow-lg', className)}>
      {/* Decorative pulse background blur */}
      <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-rose-500/10 blur-2xl pointer-events-none" />

      <CardContent className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-12 w-12 rounded-full bg-rose-500/10 border-2 border-rose-500/40 text-rose-500 flex items-center justify-center font-bold text-lg overflow-hidden shrink-0 shadow-sm">
                {partnerAvatar ? (
                  <img src={partnerAvatar} alt={partnerName} className="h-full w-full object-cover" />
                ) : (
                  <UserIcon className="h-6 w-6 stroke-[1.5]" />
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-emerald-500 border-2 border-card flex items-center justify-center shadow-xs">
                <Heart className="h-2 w-2 text-white fill-white" />
              </div>
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-foreground flex items-center gap-1.5">
                <Heart className="h-4 w-4 text-rose-500 fill-rose-500 shrink-0" />
                <span>{partnerName}</span>
              </h2>
              <p className="text-xs text-muted-foreground">Partner Current Status</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold border border-rose-500/20">
            <Activity className="h-3.5 w-3.5 animate-pulse text-rose-500" />
            <span>Live Presence</span>
          </div>
        </div>

        {/* Status Content */}
        {isLoading ? (
          <div className="p-4 rounded-2xl bg-card/60 border border-border/50 animate-pulse flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-muted" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-1/3 bg-muted rounded" />
              <div className="h-3 w-1/2 bg-muted/60 rounded" />
            </div>
          </div>
        ) : status ? (
          <div className="p-4 rounded-2xl bg-card border border-rose-500/20 shadow-xs space-y-2.5 animate-in fade-in duration-300">
            <div className="flex flex-wrap items-center gap-2">
              <StatusChip
                emoji={status.mood}
                text={status.statusMessage}
                statusType={status.statusType}
                size="md"
              />
            </div>

            <StatusTimer
              expiresAt={status.expiresAt}
              updatedAt={status.updatedAt}
              createdAt={status.createdAt}
              mode="both"
            />
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-muted/30 border border-border/40 text-center py-5">
            <p className="text-sm font-medium text-muted-foreground">No current status</p>
            <p className="text-xs text-muted-foreground/70 mt-0.5">Your partner hasn't updated their status yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
