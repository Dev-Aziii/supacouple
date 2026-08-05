import React from 'react';
import { LayoutDashboard, Heart, Sparkles, Activity, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-pink-500/20 via-purple-500/10 to-rose-500/20 border border-pink-500/30 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-pink-400" />
            <h1 className="text-2xl font-bold text-foreground">Couple Dashboard</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Welcome to your shared workspace. Connected status and active updates will appear here.
          </p>
        </div>
        <div className="px-4 py-2 rounded-2xl bg-background/60 backdrop-blur-md border border-border text-xs font-semibold text-pink-400 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>Coming Soon</span>
        </div>
      </div>

      {/* Grid Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-pink-500/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Partner Status</CardTitle>
              <Heart className="w-5 h-5 text-pink-500 fill-pink-500/20" />
            </div>
            <CardDescription>Daily mood & activity update</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-4 rounded-xl bg-accent/40 text-center space-y-1">
              <p className="text-sm font-semibold text-foreground">Status Widget</p>
              <p className="text-xs text-muted-foreground">Coming Soon</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-500/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Activities</CardTitle>
              <Activity className="w-5 h-5 text-purple-400" />
            </div>
            <CardDescription>Timeline of shared moments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-4 rounded-xl bg-accent/40 text-center space-y-1">
              <p className="text-sm font-semibold text-foreground">Activity Timeline</p>
              <p className="text-xs text-muted-foreground">Coming Soon</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-rose-500/20 md:col-span-2 lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Upcoming Dates</CardTitle>
              <Clock className="w-5 h-5 text-rose-400" />
            </div>
            <CardDescription>Next scheduled date night</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-4 rounded-xl bg-accent/40 text-center space-y-1">
              <p className="text-sm font-semibold text-foreground">Countdown Timer</p>
              <p className="text-xs text-muted-foreground">Coming Soon</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
