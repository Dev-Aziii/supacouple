import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Clock, UserPlus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { StatusUpdate } from '@/types/status';

interface PartnerHeroCardProps {
  partnerName?: string;
  partnerAvatar?: string | null;
  partnerStatus?: StatusUpdate | null;
  isLoading?: boolean;
  onQuickReply?: () => void;
  onInvitePartner?: () => void;
}

export const PartnerHeroCard: React.FC<PartnerHeroCardProps> = ({
  partnerName,
  partnerAvatar,
  partnerStatus,
  isLoading = false,
  onQuickReply,
  onInvitePartner,
}) => {
  if (!partnerName) {
    return (
      <Card>
        <CardContent className="p-6 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-secondary text-foreground flex items-center justify-center border border-border">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Pair with Your Partner</h2>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Connect with your special someone to see live status updates, plan dates together, and build lasting memories.
            </p>
          </div>
          <Button onClick={onInvitePartner} className="mt-2">
            Invite Partner Now
          </Button>
        </CardContent>
      </Card>
    );
  }

  const formatRelativeTime = (isoString?: string) => {
    if (!isoString) return 'Just now';
    const diffSec = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} min ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hr ago`;
    return `${Math.floor(diffSec / 86400)} days ago`;
  };

  return (
    <Card>
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-border bg-secondary text-foreground flex items-center justify-center font-bold text-xl overflow-hidden">
                {partnerAvatar ? (
                  <img src={partnerAvatar} alt={partnerName} className="w-full h-full object-cover" />
                ) : (
                  partnerName.charAt(0).toUpperCase()
                )}
              </div>
              {partnerStatus?.mood && (
                <span className="absolute -bottom-1 -right-1 text-lg bg-card p-0.5 rounded-full border border-border leading-none">
                  {partnerStatus.mood}
                </span>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Partner Live Status
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              </div>

              <h2 className="text-lg font-bold text-foreground">
                {partnerName}
              </h2>

              <p className="text-sm font-medium text-foreground">
                {isLoading ? (
                  <span className="animate-pulse text-muted-foreground">Loading status...</span>
                ) : partnerStatus?.statusMessage ? (
                  partnerStatus.statusMessage
                ) : (
                  <span className="text-muted-foreground italic">No status set yet</span>
                )}
              </p>

              {partnerStatus?.updatedAt && (
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground pt-0.5">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span>Updated {formatRelativeTime(partnerStatus.updatedAt)}</span>
                </div>
              )}
            </div>
          </div>

          {onQuickReply && (
            <motion.div whileTap={{ scale: 0.98 }} className="w-full sm:w-auto self-stretch sm:self-center">
              <Button
                onClick={onQuickReply}
                variant="outline"
                size="sm"
                className="w-full sm:w-auto flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Quick Reply</span>
              </Button>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

