import React from 'react';
import { BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotificationEmptyProps {
  filter: string;
  onClearFilter?: () => void;
}

export const NotificationEmpty: React.FC<NotificationEmptyProps> = ({ filter, onClearFilter }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border/60 rounded-2xl bg-card/40 backdrop-blur-sm">
      <div className="w-16 h-16 rounded-full bg-pink-500/10 flex items-center justify-center mb-4 text-pink-400">
        <BellOff className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">No notifications found</h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-6">
        {filter !== 'all'
          ? `There are no ${filter} notifications right now.`
          : 'You are all caught up! Updates from your partner will appear here.'}
      </p>
      {filter !== 'all' && onClearFilter && (
        <Button variant="outline" size="sm" onClick={onClearFilter} className="rounded-xl">
          Show All Notifications
        </Button>
      )}
    </div>
  );
};
