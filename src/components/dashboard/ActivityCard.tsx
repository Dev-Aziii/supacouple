import React from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Calendar,
  CheckCircle2,
  Gift,
  Heart,
  Camera,
  Info,
  Clock,
} from 'lucide-react';
import type { ActivityItem, ActivityType } from '@/types/activity';

interface ActivityCardProps {
  activity: ActivityItem;
  onAction?: (activity: ActivityItem) => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onAction }) => {
  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'status_updated':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'plan_created':
        return <Calendar className="w-4 h-4 text-pink-500" />;
      case 'plan_completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'proposal_created':
      case 'proposal_accepted':
      case 'proposal_declined':
        return <Gift className="w-4 h-4 text-purple-500" />;
      case 'memory_added':
      case 'memory_liked':
        return <Camera className="w-4 h-4 text-amber-500" />;
      case 'relationship_created':
      case 'relationship_ended':
        return <Heart className="w-4 h-4 text-rose-500" />;
      case 'system':
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatRelativeTime = (isoString: string) => {
    const diffSec = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const emoji = activity.metadata?.emoji as string | undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xs hover:shadow-xs transition-shadow flex items-start justify-between gap-3"
    >
      <div className="flex items-start gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300 font-bold flex items-center justify-center overflow-hidden flex-shrink-0 text-sm">
            {activity.userProfile?.avatarUrl ? (
              <img
                src={activity.userProfile.avatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              activity.userProfile?.displayName?.charAt(0).toUpperCase() || '❤'
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 p-0.5 bg-white dark:bg-gray-800 rounded-full shadow-xs border border-gray-100 dark:border-gray-700">
            {getActivityIcon(activity.type)}
          </div>
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {activity.userProfile?.displayName || 'Partner'}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-300">{activity.title}</span>
            {emoji && <span className="text-base leading-none">{emoji}</span>}
          </div>

          {activity.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg mt-1 border border-gray-100 dark:border-gray-800">
              {activity.description}
            </p>
          )}

          {activity.metadata?.image_url && (
            <div className="mt-2 rounded-lg overflow-hidden max-w-xs max-h-40 border border-gray-200 dark:border-gray-800">
              <img
                src={activity.metadata.image_url as string}
                alt="Memory"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex items-center gap-1 text-[11px] text-gray-400 pt-0.5">
            <Clock className="w-3 h-3" />
            <span>{formatRelativeTime(activity.createdAt)}</span>
          </div>
        </div>
      </div>

      {onAction && (
        <button
          onClick={() => onAction(activity)}
          className="text-xs font-semibold text-pink-600 hover:text-pink-700 hover:underline flex-shrink-0 pt-0.5"
        >
          View
        </button>
      )}
    </motion.div>
  );
};
