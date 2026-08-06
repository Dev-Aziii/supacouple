import React from 'react';
import { TimelineGroup } from './TimelineGroup';
import { Calendar } from 'lucide-react';
import type { TimelineItem } from '../../types/memory';

interface MemoryTimelineProps {
  items: TimelineItem[];
  onSelectItem?: (item: TimelineItem) => void;
  onAddMemory?: () => void;
}

export const MemoryTimeline: React.FC<MemoryTimelineProps> = ({ items, onSelectItem, onAddMemory }) => {
  if (!items || items.length === 0) {
    return (
      <div className="py-16 px-4 text-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3 max-w-md mx-auto">
        <div className="w-14 h-14 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
          <Calendar className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
          Your Timeline is Fresh & Ready
        </h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
          Add memories, plans, proposals, or milestones to see your relationship story unfurl.
        </p>
        {onAddMemory && (
          <button
            onClick={onAddMemory}
            className="mt-2 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white text-xs font-bold shadow-lg shadow-rose-500/25 hover:opacity-95 transition-opacity"
          >
            + Add First Memory
          </button>
        )}
      </div>
    );
  }

  // Group by Year and Month (e.g. "August 2026")
  const groups: Record<string, TimelineItem[]> = {};

  items.forEach((item) => {
    const d = new Date(item.date);
    const label = d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    if (!groups[label]) {
      groups[label] = [];
    }
    groups[label].push(item);
  });

  return (
    <div className="space-y-10">
      {Object.entries(groups).map(([monthYear, groupItems]) => (
        <TimelineGroup
          key={monthYear}
          monthYearLabel={monthYear}
          items={groupItems}
          onSelectItem={onSelectItem}
        />
      ))}
    </div>
  );
};
