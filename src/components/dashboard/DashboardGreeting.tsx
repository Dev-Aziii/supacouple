import React from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Heart, Sparkles } from 'lucide-react';
import { RelationshipBadge } from '@/components/couple/RelationshipBadge';
import type { RelationshipStatusType } from '@/store/relationshipStore';

interface DashboardGreetingProps {
  userName: string;
  partnerName?: string;
  relationshipStatus?: RelationshipStatusType;
  relationshipDays?: number;
  userAvatar?: string | null;
  partnerAvatar?: string | null;
}

export const DashboardGreeting: React.FC<DashboardGreetingProps> = ({
  userName,
  partnerName,
  relationshipStatus = 'single',
  relationshipDays = 0,
  userAvatar,
  partnerAvatar,
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const currentDate = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const greeting = getGreeting();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-pink-500/10 via-rose-500/10 to-purple-500/10 p-6 rounded-2xl border border-pink-100 dark:border-pink-900/30 backdrop-blur-sm"
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-pink-600 dark:text-pink-400">
          <CalendarIcon className="w-3.5 h-3.5" />
          <span>{currentDate}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          {greeting}, <span className="text-pink-600 dark:text-pink-400">{userName}</span>
          {partnerName ? ` & ${partnerName}` : ''} 👋
        </h1>

        <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1.5 pt-0.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          {partnerName
            ? `Sharing your everyday love journey with ${partnerName}`
            : 'Welcome to your love dashboard'}
        </p>
      </div>

      <div className="flex items-center gap-4 pt-2 md:pt-0">
        {/* Avatars Pair Stack */}
        <div className="flex items-center -space-x-3">
          <div className="relative w-12 h-12 rounded-full border-2 border-white dark:border-gray-800 shadow-md bg-pink-100 text-pink-700 flex items-center justify-center font-bold text-lg overflow-hidden">
            {userAvatar ? (
              <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
            ) : (
              userName.charAt(0).toUpperCase()
            )}
          </div>

          {partnerName && (
            <div className="relative w-12 h-12 rounded-full border-2 border-white dark:border-gray-800 shadow-md bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-lg overflow-hidden">
              {partnerAvatar ? (
                <img src={partnerAvatar} alt={partnerName} className="w-full h-full object-cover" />
              ) : (
                partnerName.charAt(0).toUpperCase()
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col items-start gap-1">
          <RelationshipBadge status={relationshipStatus || 'single'} />
          {relationshipDays > 0 && (
            <span className="text-xs font-semibold text-pink-600 dark:text-pink-400 flex items-center gap-1">
              <Heart className="w-3 h-3 fill-pink-500 text-pink-500" />
              {relationshipDays} Days Together
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
