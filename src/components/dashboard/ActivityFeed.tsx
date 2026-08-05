import React, { useEffect, useRef } from 'react';
import { Activity, Sparkles, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ActivityGroup } from './ActivityGroup';
import { EmptyState, SkeletonCard } from './EmptyState';
import type { GroupedActivities, ActivityItem } from '@/types/activity';

interface ActivityFeedProps {
  groupedActivities: GroupedActivities[];
  isLoading?: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onFetchNextPage?: () => void;
  onActivityAction?: (activity: ActivityItem) => void;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  groupedActivities,
  isLoading = false,
  hasNextPage = false,
  isFetchingNextPage = false,
  onFetchNextPage,
  onActivityAction,
}) => {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage || !onFetchNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onFetchNextPage();
        }
      },
      { threshold: 0.5 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, onFetchNextPage]);

  return (
    <Card className="border-pink-200 dark:border-pink-900/30 shadow-sm flex flex-col h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold flex items-center justify-between text-gray-900 dark:text-white">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-pink-500" />
            <span>Activity Feed</span>
          </div>
          <span className="text-xs font-normal text-gray-400">Live updates</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 space-y-4 overflow-y-auto max-h-[600px] pr-1">
        {isLoading ? (
          <div className="space-y-3">
            <SkeletonCard height="h-20" />
            <SkeletonCard height="h-20" />
            <SkeletonCard height="h-20" />
          </div>
        ) : groupedActivities.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No Activity Yet"
            description="Activity updates like status changes, new plans, and memories will appear here live."
          />
        ) : (
          <div className="space-y-6">
            {groupedActivities.map((group) => (
              <ActivityGroup
                key={group.dateLabel}
                group={group}
                onActivityAction={onActivityAction}
              />
            ))}

            {/* Infinite Scroll Trigger Sentinel */}
            <div ref={loadMoreRef} className="py-4 text-center">
              {isFetchingNextPage ? (
                <div className="flex items-center justify-center gap-2 text-xs text-pink-600 font-semibold">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading more activities...</span>
                </div>
              ) : hasNextPage ? (
                <span className="text-xs text-gray-400">Scroll for more</span>
              ) : (
                <span className="text-xs text-gray-400">You've reached the beginning</span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
