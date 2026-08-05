import React from 'react';
import { StatusUpdate } from '@/types/status';
import { StatusTimer } from './StatusTimer';
import { Button } from '@/components/ui/button';
import { History, X, RotateCcw } from 'lucide-react';

interface StatusHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  history: StatusUpdate[];
  onReapplyStatus: (status: StatusUpdate) => void;
  isLoading?: boolean;
}

export const StatusHistory: React.FC<StatusHistoryProps> = ({
  isOpen,
  onClose,
  history,
  onReapplyStatus,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-card text-card-foreground border border-border shadow-2xl rounded-3xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border/60">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-rose-500" />
            <h2 className="text-base font-bold">Status History</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          {isLoading ? (
            <p className="text-xs text-muted-foreground text-center py-6">Loading history...</p>
          ) : history.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">No status history available.</p>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-border/50 hover:bg-muted/60 transition-colors gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xl shrink-0 p-1.5 rounded-xl bg-card border border-border/40">
                    {item.mood || '💬'}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {item.statusMessage || item.customStatus || 'Status'}
                    </p>
                    <StatusTimer updatedAt={item.updatedAt} createdAt={item.createdAt} mode="updated" />
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onReapplyStatus(item);
                    onClose();
                  }}
                  className="text-xs h-8 gap-1.5 shrink-0 border-rose-500/30 text-rose-600 hover:bg-rose-500/10"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reuse</span>
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
