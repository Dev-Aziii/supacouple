import React from 'react';
import { Heart, CheckCircle2, Calendar, Flame, MessageSquare, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { DashboardStats } from '@/hooks/useDashboardData';

interface StatisticsCardProps {
  stats: DashboardStats;
  isLoading?: boolean;
}

export const StatisticsCard: React.FC<StatisticsCardProps> = ({ stats, isLoading = false }) => {
  const statItems = [
    {
      label: 'Days Together',
      value: stats.relationshipDays,
      icon: Heart,
      color: 'text-pink-600 bg-pink-100 dark:bg-pink-950/40',
    },
    {
      label: 'Plans Completed',
      value: stats.plansCompletedTotal,
      icon: CheckCircle2,
      color: 'text-green-600 bg-green-100 dark:bg-green-950/40',
    },
    {
      label: 'Plans This Month',
      value: stats.plansThisMonth,
      icon: Calendar,
      color: 'text-purple-600 bg-purple-100 dark:bg-purple-950/40',
    },
    {
      label: 'Current Streak',
      value: `${stats.currentStreak} Days`,
      icon: Flame,
      color: 'text-amber-600 bg-amber-100 dark:bg-amber-950/40',
    },
    {
      label: 'Statuses Updated',
      value: stats.statusesUpdatedTotal,
      icon: MessageSquare,
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-950/40',
    },
    {
      label: 'Upcoming Events',
      value: stats.upcomingEventsCount,
      icon: Sparkles,
      color: 'text-rose-600 bg-rose-100 dark:bg-rose-950/40',
    },
  ];

  return (
    <Card className="border-pink-200 dark:border-pink-900/30 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-white">
          <Sparkles className="w-5 h-5 text-amber-500" />
          Shared Statistics
        </CardTitle>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {statItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="p-3 bg-gray-50/70 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500 line-clamp-1">{item.label}</span>
                    <div className={`p-1.5 rounded-lg ${item.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <span className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white">
                    {item.value}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
