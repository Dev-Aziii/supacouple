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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-foreground flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" />
            <span>Upcoming (Next 7 Days)</span>
          </div>

          {onViewCalendar && (
            <button
              onClick={onViewCalendar}
              className="text-xs font-medium text-primary hover:underline flex items-center gap-0.5"
            >
              <span>View Calendar</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-10 bg-secondary animate-pulse rounded-xl" />
            <div className="h-10 bg-secondary animate-pulse rounded-xl" />
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
                <h5 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {date}
                </h5>
                <div className="space-y-1.5">
                  {items.map((plan) => (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-xl border border-border bg-secondary/30 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: plan.color || 'var(--primary)' }}
                        />
                        <div>
                          <p className="text-xs font-semibold text-foreground line-clamp-1">
                            {plan.title}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-muted-foreground" />
                              {new Date(plan.startAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {plan.location && (
                              <span className="flex items-center gap-0.5 line-clamp-1">
                                <MapPin className="w-3 h-3 text-muted-foreground" />
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

