import React from 'react';
import { PRESET_STATUSES, PresetStatusType } from '@/types/status';
import { cn } from '@/utils/cn';

interface StatusChipProps {
  emoji?: string | null;
  text?: string | null;
  statusType?: PresetStatusType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({
  emoji,
  text,
  statusType,
  size = 'md',
  className,
}) => {
  const presetConfig = statusType ? PRESET_STATUSES.find((p) => p.type === statusType) : undefined;
  const displayEmoji = emoji || presetConfig?.emoji || '💬';
  const displayText = text || presetConfig?.label || 'Custom';
  const colorStyle = presetConfig?.color || 'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400';

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 gap-1',
    md: 'text-sm px-3 py-1 gap-1.5',
    lg: 'text-base px-4 py-1.5 gap-2 font-medium',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border transition-all duration-200 shadow-sm',
        colorStyle,
        sizeClasses[size],
        className
      )}
    >
      <span className="shrink-0 leading-none">{displayEmoji}</span>
      <span className="truncate max-w-[200px]">{displayText}</span>
    </span>
  );
};
