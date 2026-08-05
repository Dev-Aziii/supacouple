import React from 'react';
import { PRESET_STATUSES, PresetStatusType } from '@/types/status';
import { cn } from '@/utils/cn';

interface StatusChipProps {
  emoji?: string | null;
  text?: string | null;
  statusType?: PresetStatusType;
  size?: 'sm' | 'md' | 'lg';
  isActive?: boolean;
  className?: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({
  emoji,
  text,
  statusType,
  size = 'md',
  isActive = false,
  className,
}) => {
  const presetConfig = statusType ? PRESET_STATUSES.find((p) => p.type === statusType) : undefined;
  const displayEmoji = emoji || presetConfig?.emoji || '💬';
  const displayText = text || presetConfig?.label || 'Custom';

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-xs px-3 py-1.5 gap-2',
    lg: 'text-sm px-4 py-2 gap-2 font-medium',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-xl border transition-all duration-150',
        isActive
          ? 'bg-primary/10 border-primary/30 text-primary font-semibold'
          : 'bg-secondary/40 border-border text-foreground hover:bg-secondary/70',
        sizeClasses[size],
        className
      )}
    >
      <span className="shrink-0 leading-none">{displayEmoji}</span>
      <span className="truncate max-w-[200px]">{displayText}</span>
    </span>
  );
};

