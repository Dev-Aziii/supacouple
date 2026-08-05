import React from 'react';
import { Search, ArrowUpDown } from 'lucide-react';
import { cn } from '@/utils/cn';

export type ProposalTab =
  | 'all'
  | 'pending'
  | 'upcoming'
  | 'history'
  | 'sent'
  | 'received'
  | 'completed'
  | 'cancelled';

interface ProposalFiltersProps {
  activeTab: ProposalTab;
  onTabChange: (tab: ProposalTab) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  selectedPriority: string;
  onPriorityChange: (pri: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortToggle: () => void;
  counts: Record<ProposalTab, number>;
  className?: string;
}

const TABS: { id: ProposalTab; label: string }[] = [
  { id: 'all', label: 'All Proposals' },
  { id: 'pending', label: 'Pending' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'received', label: 'Received' },
  { id: 'sent', label: 'Sent' },
  { id: 'completed', label: 'Completed' },
  { id: 'history', label: 'History' },
  { id: 'cancelled', label: 'Cancelled' },
];

export const ProposalFilters: React.FC<ProposalFiltersProps> = ({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedPriority,
  onPriorityChange,
  sortOrder,
  onSortToggle,
  counts,
  className,
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
        {TABS.map((tab) => {
          const count = counts[tab.id] || 0;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border',
                isActive
                  ? 'bg-pink-500 text-white border-pink-500 shadow-md shadow-pink-500/20'
                  : 'bg-card/40 text-muted-foreground border-border/40 hover:bg-accent hover:text-foreground'
              )}
            >
              <span>{tab.label}</span>
              {count > 0 && (
                <span
                  className={cn(
                    'px-1.5 py-0.5 rounded-full text-[10px]',
                    isActive ? 'bg-white/20 text-white' : 'bg-accent text-muted-foreground'
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search & Dropdowns */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search proposals by title, spot..."
            className="w-full bg-accent/40 border border-border/50 rounded-2xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="bg-accent/40 border border-border/50 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-pink-500/50"
          >
            <option value="all">All Categories</option>
            <option value="date">Date</option>
            <option value="trip">Trip</option>
            <option value="dining">Dining</option>
            <option value="activity">Activity</option>
            <option value="getaway">Getaway</option>
            <option value="movie">Movie</option>
            <option value="staycation">Staycation</option>
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="bg-accent/40 border border-border/50 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-pink-500/50"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          {/* Sort Order Toggle */}
          <button
            onClick={onSortToggle}
            className="p-2 rounded-xl bg-accent/40 border border-border/50 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-xs"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{sortOrder === 'asc' ? 'Oldest' : 'Newest'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
