import React from 'react';
import type { RelationshipStatusType } from '@/store/relationshipStore';
import { cn } from '@/utils/cn';

interface RelationshipBadgeProps {
  status: RelationshipStatusType;
  className?: string;
}

const statusConfig: Record<
  RelationshipStatusType,
  { label: string; bg: string; text: string; border: string; dotBg: string }
> = {
  single: {
    label: 'Single',
    bg: 'bg-slate-100 dark:bg-slate-800/60',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-700',
    dotBg: 'bg-slate-400',
  },
  invited: {
    label: 'Invitation Received',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800/50',
    dotBg: 'bg-amber-500',
  },
  pending: {
    label: 'Invite Sent',
    bg: 'bg-sky-50 dark:bg-sky-950/40',
    text: 'text-sky-700 dark:text-sky-300',
    border: 'border-sky-200 dark:border-sky-800/50',
    dotBg: 'bg-sky-500',
  },
  partnered: {
    label: 'Partnered 💕',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800/50',
    dotBg: 'bg-rose-500 animate-pulse',
  },
  paused: {
    label: 'Paused',
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800/50',
    dotBg: 'bg-purple-500',
  },
  ended: {
    label: 'Ended',
    bg: 'bg-zinc-100 dark:bg-zinc-800/60',
    text: 'text-zinc-600 dark:text-zinc-400',
    border: 'border-zinc-200 dark:border-zinc-700',
    dotBg: 'bg-zinc-400',
  },
};

export const RelationshipBadge: React.FC<RelationshipBadgeProps> = ({ status, className }) => {
  const config = statusConfig[status] || statusConfig.single;

  return (
    <span
      role="status"
      aria-label={`Relationship status: ${config.label}`}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm shadow-sm transition-all',
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      <span className={cn('h-2 w-2 rounded-full', config.dotBg)} aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
};
