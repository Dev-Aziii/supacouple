import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Trash2 } from 'lucide-react';
import type { RelationshipMilestone } from '../../types/memory';

interface MilestoneCardProps {
  milestone: RelationshipMilestone;
  onDelete?: (id: string) => void;
}

const TYPE_ICONS: Record<string, string> = {
  'First Date': '🥂',
  'First Trip': '✈️',
  Anniversary: '💖',
  'Moved In': '🏡',
  Proposal: '💍',
  Wedding: '💒',
  Vacation: '🏝️',
  Custom: '✨',
};

export const MilestoneCard: React.FC<MilestoneCardProps> = ({ milestone, onDelete }) => {
  const icon = TYPE_ICONS[milestone.type] || '✨';

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      className="relative group p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/60 shadow-sm hover:shadow-md transition-all flex items-start gap-4"
    >
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center text-2xl shadow-md flex-shrink-0">
        {icon}
      </div>

      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
            {milestone.type}
          </span>

          {onDelete && (
            <button
              onClick={() => onDelete(milestone.id)}
              className="p-1 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
              title="Delete milestone"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
          {milestone.title}
        </h3>

        {milestone.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400">{milestone.description}</p>
        )}

        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium pt-1">
          <Calendar className="w-3.5 h-3.5 text-rose-500" />
          <span>{new Date(milestone.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>
    </motion.div>
  );
};
