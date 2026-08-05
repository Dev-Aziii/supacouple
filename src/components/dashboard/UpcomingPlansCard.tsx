import React from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Clock, MapPin, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { EmptyState } from './EmptyState';
import type { PlanItem } from '@/types/plan';

interface UpcomingPlansCardProps {
  upcomingPlans: PlanItem[];
  isLoading?: boolean;
  onViewCalendar?: () => void;
}

export const UpcomingPlansCard: React.FC<UpcomingPlansCardProps> = ({
  upcomingPlans,
  isLoading = false,
  onViewCalendar,
}) => {
  // Group next 7 days plans by date
  const groupUpcomingByDate = (plans: PlanItem[]) => {
    const map = new Map<string, PlanItem[]>();
    for (const plan of plans) {
      const dateKey = new Date(plan.startAt).toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(plan);
    }
    return Array.from(map.entries()).map(([date, items]) => ({ date, items }));
  };

  const grouped = groupUpcomingByDate(upcomingPlans);

  return (
    <Card className="border-pink-200 dark:border-pink-900/30 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-white">
          <CalendarDays className="w-5 h-5 text-rose-500" />
          Upcoming (Next 7 Days)
        </CardTitle>

        {onViewCalendar && (
          <button
            onClick={onViewCalendar}
            className="text-xs font-semibold text-pink-600 hover:text-pink-700 flex items-center gap-0.5"
          >
            <span>Full Calendar</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-10 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />
            <div className="h-10 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />
          </div>
        ) : grouped.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No Upcoming Events"
            description="You don't have any plans scheduled for the next 7 days."
          />
        ) : (
          <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
            {grouped.map(({ date, items }) => (
              <div key={date} className="space-y-1.5">
                <h5 className="text-xs font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400">
                  {date}
                </h5>
                <div className="space-y-1.5">
                  {items.map((plan) => (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-2.5 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: plan.color || '#ec4899' }}
                        />
                        <div>
                          <p className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">
                            {plan.title}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(plan.startAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {plan.location && (
                              <span className="flex items-center gap-0.5 line-clamp-1">
                                <MapPin className="w-3 h-3" />
                                {plan.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
