import React from 'react';
import { StatusUpdate } from '@/types/status';
import { StatusChip } from './StatusChip';
import { StatusTimer } from './StatusTimer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit3, Trash2, History, Plus } from 'lucide-react';
import { cn } from '@/utils/cn';

interface StatusCardProps {
  status: StatusUpdate | null;
  isLoading?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onViewHistory: () => void;
  className?: string;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  status,
  isLoading = false,
  onEdit,
  onDelete,
  onViewHistory,
  className,
}) => {
  return (
    <Card className={cn(className)}>
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Your Status</h3>
            <p className="text-xs text-muted-foreground">Tell your partner what you're doing</p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onViewHistory}
            className="text-xs text-muted-foreground hover:text-foreground gap-1.5 h-8 px-2.5"
          >
            <History className="h-3.5 w-3.5" />
            <span>History</span>
          </Button>
        </div>

        {isLoading ? (
          <div className="p-4 rounded-xl bg-secondary/40 border border-border animate-pulse flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-secondary" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-1/3 bg-secondary rounded" />
              <div className="h-3 w-1/2 bg-secondary/60 rounded" />
            </div>
          </div>
        ) : status ? (
          <div className="p-4 rounded-xl bg-secondary/30 border border-border space-y-3">
            <div className="flex items-center justify-between gap-3">
              <StatusChip
                emoji={status.mood}
                text={status.statusMessage}
                statusType={status.statusType}
                size="md"
                isActive={true}
              />

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onEdit}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  aria-label="Edit status"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDelete}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  aria-label="Delete status"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <StatusTimer
              expiresAt={status.expiresAt}
              updatedAt={status.updatedAt}
              createdAt={status.createdAt}
              mode="both"
            />
          </div>
        ) : (
          <div className="p-5 rounded-xl border border-dashed border-border text-center space-y-3 bg-secondary/20">
            <p className="text-xs text-muted-foreground">You don't have an active status set right now.</p>
            <Button
              onClick={onEdit}
              size="sm"
              className="text-xs gap-1.5 h-8 px-3"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Set Status</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

