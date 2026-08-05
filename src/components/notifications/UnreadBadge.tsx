import React from 'react';
import { cn } from '@/utils/cn';

interface UnreadBadgeProps {
  count: number;
  className?: string;
  dotOnly?: boolean;
}

export const UnreadBadge: React.FC<UnreadBadgeProps> = ({ count, className, dotOnly = false }) => {
  if (count <= 0) return null;

  if (dotOnly) {
    return (
      <span
        className={cn(
          'inline-block w-2.5 h-2.5 rounded-full bg-pink-500 ring-2 ring-background animate-pulse',
          className
        )}
        aria-label={`${count} unread notifications`}
      />
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-gradient-to-r from-pink-500 to-rose-500 rounded-full shadow-sm min-w-[1.25rem] h-5',
        className
      )}
      aria-label={`${count} unread notifications`}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
};
