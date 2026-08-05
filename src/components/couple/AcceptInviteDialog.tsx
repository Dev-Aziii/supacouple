import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ButtonSpinner } from '@/components/ui/ButtonSpinner';
import { Heart, X, CheckCircle2, Calendar } from 'lucide-react';

interface AcceptInviteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: (code: string, anniversary?: string) => Promise<void>;
  initialCode?: string;
  isAccepting?: boolean;
}

export const AcceptInviteDialog: React.FC<AcceptInviteDialogProps> = ({
  isOpen,
  onClose,
  onAccept,
  initialCode = '',
  isAccepting = false,
}) => {
  const [code, setCode] = useState(initialCode);
  const [anniversary, setAnniversary] = useState('');
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialCode) setCode(initialCode);
  }, [initialCode]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isAccepting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isAccepting, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Please enter an invitation code');
      return;
    }

    setError(null);
    try {
      await onAccept(code.trim().toUpperCase(), anniversary || undefined);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to accept invitation';
      setError(msg);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="accept-invite-title"
      aria-describedby="accept-invite-description"
    >
      <div className="w-full max-w-md rounded-3xl bg-card border border-border/80 shadow-2xl p-6 relative space-y-6 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isAccepting}
          className="absolute top-5 right-5 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icon & Title */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="p-3 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500">
            <Heart className="h-8 w-8 fill-rose-500/20" />
          </div>
          <h2 id="accept-invite-title" className="text-xl font-bold text-foreground">
            Connect With Partner
          </h2>
          <p id="accept-invite-description" className="text-xs text-muted-foreground">
            Enter the 8-character code sent by your partner to create your shared couple space.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="invite-code-input" className="text-xs font-semibold text-foreground">
              Invitation Code <span className="text-rose-500">*</span>
            </label>
            <Input
              id="invite-code-input"
              ref={inputRef}
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. AB7Q9KX2"
              maxLength={10}
              required
              className="font-mono text-center tracking-widest uppercase font-bold text-lg h-12 border-rose-500/30 focus:border-rose-500"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="anniversary-input" className="text-xs font-semibold text-foreground flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-rose-500" />
              <span>Anniversary Date (Optional)</span>
            </label>
            <Input
              id="anniversary-input"
              type="date"
              value={anniversary}
              onChange={(e) => setAnniversary(e.target.value)}
              className="text-sm"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isAccepting}
              className="flex-1"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isAccepting || !code.trim()}
              className="flex-1 bg-rose-600 hover:bg-rose-700 text-white gap-2"
            >
              {isAccepting ? (
                <>
                  <ButtonSpinner />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Accept Invite</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
