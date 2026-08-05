import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Plus, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from './EmptyState';
import type { PlanItem } from '@/types/plan';

interface TodayPlansCardProps {
  todayPlans: PlanItem[];
  isLoading?: boolean;
  onCreatePlan?: () => void;
  onViewAllPlans?: () => void;
}

export const TodayPlansCard: React.FC<TodayPlansCardProps> = ({
  todayPlans,
  isLoading = false,
  onCreatePlan,
  onViewAllPlans,
}) => {
  const [countdownText, setCountdownText] = useState<string>('');

  const nextPlan = todayPlans.find((p) => !p.completed && new Date(p.startAt) > new Date());

  useEffect(() => {
    if (!nextPlan) {
      setCountdownText('');
      return;
    }

    const updateCountdown = () => {
      const now = new Date().getTime();
      const target = new Date(nextPlan.startAt).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setCountdownText('Happening now');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setCountdownText(`in ${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setCountdownText(`in ${minutes}m ${seconds}s`);
      } else {
        setCountdownText(`in ${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [nextPlan]);

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-foreground flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span>Today's Plans</span>
          </div>

          <div className="flex items-center gap-2">
            {onCreatePlan && (
              <Button onClick={onCreatePlan} size="sm" className="h-8 text-xs">
                <Plus className="w-3.5 h-3.5 mr-1" />
                Create Plan
              </Button>
            )}
            {onViewAllPlans && (
              <Button onClick={onViewAllPlans} variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Next Event Countdown Hero Banner */}
        {nextPlan && (
          <div className="bg-primary/10 border border-primary/20 text-foreground p-4 rounded-xl flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">Next Event</span>
              <h4 className="font-semibold text-sm line-clamp-1">{nextPlan.title}</h4>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTime(nextPlan.startAt)}</span>
                {nextPlan.location && (
                  <>
                    <span>•</span>
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="line-clamp-1">{nextPlan.location}</span>
                  </>
                )}
              </div>
            </div>
            {countdownText && (
              <div className="bg-card border border-border px-3 py-1.5 rounded-lg text-xs font-semibold text-primary whitespace-nowrap">
                {countdownText}
              </div>
            )}
          </div>
        )}

        {/* Today's Schedule List */}
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-12 bg-secondary animate-pulse rounded-xl" />
            <div className="h-12 bg-secondary animate-pulse rounded-xl" />
          </div>
        ) : todayPlans.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No Plans Today"
            description="Your schedule is open today! Create a date or activity together."
            action={
              onCreatePlan && (
                <Button onClick={onCreatePlan} size="sm" variant="outline">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Today's Plan
                </Button>
              )
            }
          />
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {todayPlans.map((plan) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                  plan.completed
                    ? 'bg-secondary/20 border-border opacity-60'
                    : 'bg-secondary/40 border-border hover:bg-secondary/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: plan.color || 'var(--primary)' }}
                  />
                  <div>
                    <h5
                      className={`text-xs font-semibold ${
                        plan.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                      }`}
                    >
                      {plan.title}
                    </h5>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span>
                        {formatTime(plan.startAt)} - {formatTime(plan.endAt)}
                      </span>
                      {plan.location && (
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-3 h-3" />
                          {plan.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {plan.completed && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

