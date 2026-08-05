import React from 'react';
import type { PlanItem } from '../../types/plan';
import { Repeat, CheckCircle2 } from 'lucide-react';

interface PlanChipProps {
  plan: PlanItem;
  onClick?: (plan: PlanItem) => void;
  compact?: boolean;
}

export const PlanChip: React.FC<PlanChipProps> = ({ plan, onClick, compact = false }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) onClick(plan);
  };

  const startTimeStr = new Date(plan.startAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <button
      type="button"
      onClick={handleClick}
      style={{ borderLeftColor: plan.color || '#ec4899' }}
      className={`w-full text-left truncate rounded px-1.5 py-1 text-xs transition-all duration-150 border-l-4 shadow-sm hover:shadow hover:brightness-105 ${
        plan.completed
          ? 'bg-slate-100 text-slate-500 line-through dark:bg-slate-800 dark:text-slate-400'
          : 'bg-white/80 dark:bg-slate-900/80 text-slate-800 dark:text-slate-100 backdrop-blur-sm'
      }`}
    >
      <div className="flex items-center gap-1.5 truncate">
        {plan.completed && <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />}
        {plan.repeat !== 'none' && <Repeat className="w-3 h-3 text-indigo-400 shrink-0" />}
        <span className="font-semibold truncate">{plan.title}</span>
        {!compact && <span className="text-[10px] opacity-70 ml-auto shrink-0">{startTimeStr}</span>}
      </div>
    </button>
  );
};
