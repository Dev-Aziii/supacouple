import React from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageSquare, Clock, UserPlus, Sparkles } from 'lucide-react';
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
      <Card className="border-pink-200 bg-gradient-to-br from-pink-50 via-rose-50 to-white dark:from-pink-950/20 dark:via-rose-950/10 dark:to-gray-900 shadow-sm overflow-hidden">
        <CardContent className="p-6 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-400 flex items-center justify-center shadow-inner">
            <UserPlus className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pair with Your Partner</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
              Connect with your special someone to see live status updates, plan dates together, and build lasting memories.
            </p>
          </div>
          <Button
            onClick={onInvitePartner}
            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold shadow-md rounded-full px-6"
          >
            <Sparkles className="w-4 h-4 mr-2" />
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
    <Card className="border-pink-200 dark:border-pink-900/40 bg-gradient-to-r from-rose-500/10 via-pink-500/5 to-purple-500/10 dark:from-pink-950/30 dark:to-purple-950/20 shadow-md relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <Heart className="w-32 h-32 fill-pink-500 text-pink-500" />
      </div>

      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-white dark:border-gray-800 shadow-lg bg-pink-100 text-pink-700 flex items-center justify-center font-bold text-2xl overflow-hidden">
                {partnerAvatar ? (
                  <img src={partnerAvatar} alt={partnerName} className="w-full h-full object-cover" />
                ) : (
                  partnerName.charAt(0).toUpperCase()
                )}
              </div>
              {partnerStatus?.mood && (
                <span className="absolute -bottom-1 -right-1 text-2xl bg-white dark:bg-gray-800 p-1 rounded-full shadow-md leading-none border border-gray-100 dark:border-gray-700">
                  {partnerStatus.mood}
                </span>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-pink-600 dark:text-pink-400">
                  Partner's Live Status
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                  Live
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
                {partnerName}
              </h2>

              <p className="text-base font-medium text-gray-700 dark:text-gray-200">
                {isLoading ? (
                  <span className="animate-pulse">Loading status...</span>
                ) : partnerStatus?.statusMessage ? (
                  partnerStatus.statusMessage
                ) : (
                  <span className="text-gray-400 italic">No status set yet</span>
                )}
              </p>

              {partnerStatus?.updatedAt && (
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 pt-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Updated {formatRelativeTime(partnerStatus.updatedAt)}</span>
                </div>
              )}
            </div>
          </div>

          {onQuickReply && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
              <Button
                onClick={onQuickReply}
                variant="outline"
                className="w-full sm:w-auto border-pink-300 dark:border-pink-700 text-pink-700 dark:text-pink-300 hover:bg-pink-50 dark:hover:bg-pink-900/30 font-semibold rounded-full shadow-sm"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Quick Reply / Send Love
              </Button>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
