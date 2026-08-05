import React from 'react';
import { ActivityCard } from './ActivityCard';
import type { GroupedActivities, ActivityItem } from '@/types/activity';

interface ActivityGroupProps {
  group: GroupedActivities;
  onActivityAction?: (activity: ActivityItem) => void;
}

export const ActivityGroup: React.FC<ActivityGroupProps> = ({ group, onActivityAction }) => {
  return (
    <div className="space-y-2">
      <div className="sticky top-0 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xs py-1">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-500 flex items-center gap-2">
          <span>{group.dateLabel}</span>
          <div className="h-px bg-gray-100 dark:bg-gray-800 flex-1" />
        </h4>
      </div>

      <div className="space-y-2.5">
        {group.activities.map((activity) => (
          <ActivityCard key={activity.id} activity={activity} onAction={onActivityAction} />
        ))}
      </div>
    </div>
  );
};
