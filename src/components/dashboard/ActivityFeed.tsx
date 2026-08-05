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
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-foreground flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            <span>Activity Feed</span>
          </div>
          <span className="text-[11px] font-medium text-muted-foreground">Live updates</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 space-y-4 overflow-y-auto max-h-[500px] pr-1">
        {isLoading ? (
          <div className="space-y-3">
            <SkeletonCard height="h-16" />
            <SkeletonCard height="h-16" />
            <SkeletonCard height="h-16" />
          </div>
        ) : groupedActivities.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No Activity Yet"
            description="Activity updates like status changes, new plans, and memories will appear here live."
          />
        ) : (
          <div className="space-y-5">
            {groupedActivities.map((group) => (
              <ActivityGroup
                key={group.dateLabel}
                group={group}
                onActivityAction={onActivityAction}
              />
            ))}

            {/* Infinite Scroll Trigger Sentinel */}
            <div ref={loadMoreRef} className="py-3 text-center">
              {isFetchingNextPage ? (
                <div className="flex items-center justify-center gap-2 text-xs text-primary font-medium">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Loading more...</span>
                </div>
              ) : hasNextPage ? (
                <span className="text-xs text-muted-foreground">Scroll for more</span>
              ) : (
                <span className="text-xs text-muted-foreground">End of activities</span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

