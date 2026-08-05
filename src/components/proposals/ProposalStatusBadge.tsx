import React from 'react';
import { ProposalStatus } from '@/types/proposal';
import { cn } from '@/utils/cn';
import {
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RefreshCw,
  AlertCircle,
  Ban,
  CheckCheck,
} from 'lucide-react';

interface ProposalStatusBadgeProps {
  status: ProposalStatus;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ProposalStatusBadge: React.FC<ProposalStatusBadgeProps> = ({
  status,
  className,
  size = 'md',
}) => {
  const statusConfigs: Record<
    ProposalStatus,
    { label: string; bg: string; text: string; border: string; icon: React.ElementType }
  > = {
    pending: {
      label: 'Pending Response',
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      icon: Clock,
    },
    accepted: {
      label: 'Accepted! 🎉',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      icon: CheckCircle2,
    },
    declined: {
      label: 'Declined',
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      border: 'border-rose-500/30',
      icon: XCircle,
    },
    maybe: {
      label: 'Maybe',
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      border: 'border-purple-500/30',
      icon: HelpCircle,
    },
    countered: {
      label: 'Countered 💡',
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
      border: 'border-blue-500/30',
      icon: RefreshCw,
    },
    expired: {
      label: 'Expired',
      bg: 'bg-slate-500/10',
      text: 'text-slate-400',
      border: 'border-slate-500/30',
      icon: AlertCircle,
    },
    cancelled: {
      label: 'Cancelled',
      bg: 'bg-gray-500/10',
      text: 'text-gray-400',
      border: 'border-gray-500/30',
      icon: Ban,
    },
    completed: {
      label: 'Completed ✨',
      bg: 'bg-pink-500/10',
      text: 'text-pink-400',
      border: 'border-pink-500/30',
      icon: CheckCheck,
    },
  };

  const config = statusConfigs[status] || statusConfigs.pending;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3.5 py-1.5 text-sm gap-2',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border backdrop-blur-sm shadow-sm transition-all',
        config.bg,
        config.text,
        config.border,
        sizeClasses[size],
        className
      )}
    >
      <Icon className={cn('shrink-0', size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5')} />
      <span>{config.label}</span>
    </span>
  );
};
