import React from 'react';
import { Calendar, Plus, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export const PlansPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="w-7 h-7 text-purple-400" />
            <span>Date & Trip Plans</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Schedule upcoming dates, trips, and bucket list activities
          </p>
        </div>
        <Button disabled className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-1.5" /> Create New Plan
        </Button>
      </div>

      <Card className="text-center py-16 px-4">
        <CardHeader className="max-w-md mx-auto space-y-3">
          <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 mx-auto">
            <MapPin className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl">Plans Module</CardTitle>
          <CardDescription>
            Shared bucket lists, interactive calendar scheduling, and location recommendations will be built in Phase 3.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <span className="inline-block px-4 py-1.5 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold">
            Coming Soon
          </span>
        </CardContent>
      </Card>
    </div>
  );
};
