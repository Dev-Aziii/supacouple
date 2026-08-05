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
    <Card className="border-pink-200 dark:border-pink-900/30 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-white">
          <Calendar className="w-5 h-5 text-pink-500" />
          Today's Plans
        </CardTitle>

        <div className="flex items-center gap-2">
          {onCreatePlan && (
            <Button
              onClick={onCreatePlan}
              size="sm"
              className="bg-pink-500 hover:bg-pink-600 text-white rounded-full h-8 px-3 text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Create Plan
            </Button>
          )}
          {onViewAllPlans && (
            <Button onClick={onViewAllPlans} variant="ghost" size="sm" className="h-8 px-2 text-xs text-gray-500">
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Next Event Countdown Hero Banner */}
        {nextPlan && (
          <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white p-4 rounded-xl shadow-sm flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs uppercase tracking-wider font-semibold opacity-90">Next Event</span>
              <h4 className="font-bold text-base line-clamp-1">{nextPlan.title}</h4>
              <div className="flex items-center gap-2 text-xs opacity-90">
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
              <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-extrabold text-white whitespace-nowrap shadow-inner">
                {countdownText}
              </div>
            )}
          </div>
        )}

        {/* Today's Schedule List */}
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-12 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />
            <div className="h-12 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />
          </div>
        ) : todayPlans.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No Plans Today"
            description="Your schedule is open today! Create a date or activity together."
            action={
              onCreatePlan && (
                <Button onClick={onCreatePlan} size="sm" variant="outline" className="text-pink-600 border-pink-300">
                  <Plus className="w-4 h-4 mr-1" /> Add Today's Plan
                </Button>
              )
            }
          />
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {todayPlans.map((plan) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                  plan.completed
                    ? 'bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-800 opacity-60'
                    : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-pink-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: plan.color || '#ec4899' }}
                  />
                  <div>
                    <h5
                      className={`text-sm font-semibold ${
                        plan.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {plan.title}
                    </h5>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
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

                {plan.completed && <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />}
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
