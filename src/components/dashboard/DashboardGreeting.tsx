import React from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Heart } from 'lucide-react';
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
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card p-6 rounded-2xl border border-border shadow-none"
    >
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
          <span>{currentDate}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          {greeting}, <span className="text-primary">{userName}</span>
          {partnerName ? ` & ${partnerName}` : ''}
        </h1>

        <p className="text-xs text-muted-foreground">
          {partnerName
            ? `Sharing your everyday journey with ${partnerName}`
            : 'Welcome to your shared dashboard'}
        </p>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        {/* Avatars Pair Stack */}
        <div className="flex items-center -space-x-2">
          <div className="relative w-10 h-10 rounded-full border-2 border-card bg-secondary text-foreground flex items-center justify-center font-semibold text-sm overflow-hidden shrink-0">
            {userAvatar ? (
              <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
            ) : (
              userName.charAt(0).toUpperCase()
            )}
          </div>

          {partnerName && (
            <div className="relative w-10 h-10 rounded-full border-2 border-card bg-secondary text-foreground flex items-center justify-center font-semibold text-sm overflow-hidden shrink-0">
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
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Heart className="w-3 h-3 text-primary fill-primary" />
              {relationshipDays} Days Together
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

