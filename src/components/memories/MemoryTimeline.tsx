import React from 'react';
import { TimelineGroup } from './TimelineGroup';
import { Calendar } from 'lucide-react';
import type { TimelineItem } from '../../types/memory';

interface MemoryTimelineProps {
  items: TimelineItem[];
  onSelectItem?: (item: TimelineItem) => void;
}

export const MemoryTimeline: React.FC<MemoryTimelineProps> = ({ items, onSelectItem }) => {
  if (!items || items.length === 0) {
    return (
      <div className="py-16 text-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
        <Calendar className="w-12 h-12 text-rose-300 dark:text-rose-900 mx-auto mb-2" />
        <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
          Your Timeline is Fresh & Ready
        </h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Add memories, plans, proposals, or status updates to see your relationship story unfurl.
        </p>
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
