import React from 'react';
import type { PlanPriority } from '../../types/plan';
import { AlertCircle, ArrowUp, Minus } from 'lucide-react';

interface PriorityBadgeProps {
  priority: PlanPriority;
  className?: string;
  size?: 'sm' | 'md';
}

const PRIORITY_CONFIG: Record<
  PlanPriority,
  { label: string; icon: React.ComponentType<{ className?: string }>; bgClass: string; textClass: string }
> = {
  high: { label: 'High Priority', icon: AlertCircle, bgClass: 'bg-red-500/15', textClass: 'text-red-600 dark:text-red-400' },
  medium: { label: 'Medium', icon: ArrowUp, bgClass: 'bg-amber-500/15', textClass: 'text-amber-600 dark:text-amber-400' },
  low: { label: 'Low', icon: Minus, bgClass: 'bg-slate-500/15', textClass: 'text-slate-600 dark:text-slate-400' },
};

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className = '', size = 'md' }) => {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;
  const Icon = config.icon;

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs gap-1' : 'px-2.5 py-1 text-xs gap-1.5';
  const iconSizes = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${config.bgClass} ${config.textClass} ${sizeClasses} ${className}`}
    >
      <Icon className={iconSizes} />
      <span>{config.label}</span>
    </span>
  );
};
