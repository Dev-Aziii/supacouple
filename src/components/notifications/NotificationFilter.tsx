import React from 'react';
import { Filter } from 'lucide-react';
import type { NotificationFilter as FilterType } from '@/types/settings';
import { cn } from '@/utils/cn';

interface NotificationFilterProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const FILTER_OPTIONS: { id: FilterType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'plan', label: 'Plans' },
  { id: 'proposal', label: 'Proposals' },
  { id: 'memory', label: 'Memories' },
  { id: 'status', label: 'Statuses' },
  { id: 'system', label: 'System' },
];

export const NotificationFilter: React.FC<NotificationFilterProps> = ({
  activeFilter,
  onFilterChange,
}) => {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
      <div className="flex items-center text-xs text-muted-foreground mr-1 gap-1 flex-shrink-0">
        <Filter className="w-3.5 h-3.5" />
        <span>Filter:</span>
      </div>
      {FILTER_OPTIONS.map((opt) => {
        const isActive = activeFilter === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => onFilterChange(opt.id)}
            className={cn(
              'px-3 py-1 rounded-xl text-xs font-medium transition-all whitespace-nowrap border',
              isActive
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-card/60 text-muted-foreground border-border/40 hover:text-foreground hover:bg-accent'
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};
