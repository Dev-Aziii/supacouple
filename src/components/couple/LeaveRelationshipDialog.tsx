import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ButtonSpinner } from '@/components/ui/ButtonSpinner';
import { AlertTriangle, X, ShieldAlert } from 'lucide-react';

interface LeaveRelationshipDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  partnerName?: string;
  isLeaving?: boolean;
}

export const LeaveRelationshipDialog: React.FC<LeaveRelationshipDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  partnerName = 'your partner',
  isLeaving = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLeaving) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLeaving, onClose]);

  if (!isOpen) return null;

  const handleLeave = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      console.error('Failed to leave relationship:', err);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="leave-relationship-title"
      aria-describedby="leave-relationship-description"
    >
      <div className="w-full max-w-md rounded-3xl bg-card border border-rose-500/40 shadow-2xl p-6 relative space-y-6 animate-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLeaving}
          className="absolute top-5 right-5 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header Icon */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="p-3 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h2 id="leave-relationship-title" className="text-xl font-bold text-foreground">
            Leave Relationship?
          </h2>
          <p id="leave-relationship-description" className="text-xs text-muted-foreground">
            Are you sure you want to un-pair from <strong className="text-foreground">{partnerName}</strong>?
          </p>
        </div>

        {/* Data Safety Info Notice */}
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex gap-3 text-xs text-amber-800 dark:text-amber-300">
          <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Your memories and plans are preserved</p>
            <p className="text-amber-700/80 dark:text-amber-400/80">
              Leaving the relationship will un-link your profiles, but your historical shared memories and plans will not be deleted.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLeaving}
            className="flex-1"
          >
            Keep Relationship
          </Button>

          <Button
            type="button"
            onClick={handleLeave}
            disabled={isLeaving}
            className="flex-1 bg-rose-600 hover:bg-rose-700 text-white gap-2"
          >
            {isLeaving ? (
              <>
                <ButtonSpinner />
                <span>Leaving...</span>
              </>
            ) : (
              <span>Confirm & Leave</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
