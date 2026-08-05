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
    },
    {
      label: 'Plans Completed',
      value: stats.plansCompletedTotal,
      icon: CheckCircle2,
    },
    {
      label: 'Plans This Month',
      value: stats.plansThisMonth,
      icon: Calendar,
    },
    {
      label: 'Current Streak',
      value: `${stats.currentStreak} Days`,
      icon: Flame,
    },
    {
      label: 'Statuses Updated',
      value: stats.statusesUpdatedTotal,
      icon: MessageSquare,
    },
    {
      label: 'Upcoming Events',
      value: stats.upcomingEventsCount,
      icon: Sparkles,
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span>Shared Statistics</span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-secondary animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {statItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="p-3.5 bg-secondary/30 rounded-xl border border-border flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-muted-foreground truncate">{item.label}</span>
                    <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                  </div>
                  <span className="text-lg font-bold text-foreground">
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

