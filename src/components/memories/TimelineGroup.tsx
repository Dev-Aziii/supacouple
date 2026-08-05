import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Trophy, Calendar, Sparkles, HeartHandshake, MapPin } from 'lucide-react';
import type { TimelineItem, TimelineEventType } from '../../types/memory';

interface TimelineGroupProps {
  monthYearLabel: string;
  items: TimelineItem[];
  onSelectItem?: (item: TimelineItem) => void;
}

const EVENT_ICONS: Record<TimelineEventType, { icon: React.ReactNode; color: string }> = {
  memory: { icon: <Camera className="w-4 h-4" />, color: 'bg-rose-500 text-white' },
  milestone: { icon: <Trophy className="w-4 h-4" />, color: 'bg-amber-500 text-white' },
  plan: { icon: <Calendar className="w-4 h-4" />, color: 'bg-blue-500 text-white' },
  proposal: { icon: <Sparkles className="w-4 h-4" />, color: 'bg-purple-500 text-white' },
  status: { icon: <HeartHandshake className="w-4 h-4" />, color: 'bg-emerald-500 text-white' },
};

export const TimelineGroup: React.FC<TimelineGroupProps> = ({
  monthYearLabel,
  items,
  onSelectItem,
}) => {
  return (
    <div className="space-y-6">
      {/* Month/Year Header Badge */}
      <div className="sticky top-20 z-10 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/90 text-white text-xs font-bold shadow-md backdrop-blur-md">
        <span>{monthYearLabel}</span>
        <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
        <span className="font-medium text-white/80">{items.length} moments</span>
      </div>

      {/* Timeline Items List */}
      <div className="relative pl-6 sm:pl-8 space-y-6 border-l-2 border-rose-200 dark:border-rose-950 ml-3 sm:ml-4">
        {items.map((item) => {
          const config = EVENT_ICONS[item.type] || EVENT_ICONS.memory;

          return (
            <motion.div
              key={item.id}
              whileHover={{ x: 4 }}
              onClick={() => onSelectItem?.(item)}
              className="relative cursor-pointer group bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm hover:shadow-lg transition-all"
            >
              {/* Event Icon Pin */}
              <div
                className={`absolute -left-[31px] sm:-left-[39px] top-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-md ring-4 ring-white dark:ring-slate-950 ${config.color}`}
              >
                {config.icon}
              </div>

              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                <span className="font-semibold text-rose-500 uppercase tracking-wider text-[10px]">
                  {item.type}
                </span>
                <span className="text-slate-400 font-medium">
                  {new Date(item.date).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

              {/* Title & Description */}
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 group-hover:text-rose-500 transition-colors mt-0.5">
                {item.title}
              </h4>

              {item.description && (
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                  {item.description}
                </p>
              )}

              {/* Cover Image preview if available */}
              {item.coverImage && (
                <div className="mt-3 h-40 w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
              )}

              {/* Location Tag */}
              {item.location && (
                <div className="mt-2 inline-flex items-center gap-1 text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>{item.location}</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
