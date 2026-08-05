import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/utils/cn';

interface StatusTimerProps {
  expiresAt?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
  mode?: 'expires' | 'updated' | 'both';
  className?: string;
}

export const StatusTimer: React.FC<StatusTimerProps> = ({
  expiresAt,
  updatedAt,
  createdAt,
  mode = 'both',
  className,
}) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 10000);
    return () => clearInterval(timer);
  }, []);

  const getRemainingText = (): string => {
    if (!expiresAt) return 'Until Changed';
    const expiresMs = new Date(expiresAt).getTime();
    const nowMs = Date.now();
    const diffMs = expiresMs - nowMs;

    if (diffMs <= 0) return 'Expired';

    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 60) {
      return `Expires in ${diffMins}m`;
    }
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return mins > 0 ? `Expires in ${hours}h ${mins}m` : `Expires in ${hours}h`;
  };

  const getRelativeUpdatedText = (): string => {
    const targetDate = updatedAt || createdAt;
    if (!targetDate) return '';
    const dateMs = new Date(targetDate).getTime();
    const nowMs = Date.now();
    const diffMins = Math.max(0, Math.floor((nowMs - dateMs) / (1000 * 60)));

    if (diffMins < 1) return 'Updated just now';
    if (diffMins < 60) return `Updated ${diffMins}m ago`;
    const hours = Math.floor(diffMins / 60);
    if (hours < 24) return `Updated ${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `Updated ${days}d ago`;
  };

  const remainingStr = getRemainingText();
  const updatedStr = getRelativeUpdatedText();

  return (
    <div className={cn('flex items-center gap-3 text-xs text-muted-foreground', className)}>
      {(mode === 'expires' || mode === 'both') && (
        <span className="flex items-center gap-1 font-medium text-foreground/80">
          <Clock className="h-3.5 w-3.5 text-rose-500" />
          <span>{remainingStr}</span>
        </span>
      )}

      {mode === 'both' && updatedStr && <span className="opacity-40">•</span>}

      {(mode === 'updated' || mode === 'both') && updatedStr && (
        <span>{updatedStr}</span>
      )}
    </div>
  );
};
