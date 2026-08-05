import React from 'react';
import type { PlanItem } from '../../types/plan';
import { PlanTimeline } from './PlanTimeline';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';

interface DayViewProps {
  currentDate: Date;
  plans: PlanItem[];
  currentUserId?: string;
  onToggleComplete?: (plan: PlanItem) => void;
  onEdit?: (plan: PlanItem) => void;
  onDelete?: (plan: PlanItem) => void;
  onSelectPlan?: (plan: PlanItem) => void;
  onAddPlanForDate?: (date: Date) => void;
}

export const DayView: React.FC<DayViewProps> = ({
  currentDate,
  plans,
  currentUserId,
  onToggleComplete,
  onEdit,
  onDelete,
  onSelectPlan,
  onAddPlanForDate,
}) => {
  const dayPlans = plans.filter((plan) => {
    const pStart = new Date(plan.startAt);
    return (
      pStart.getFullYear() === currentDate.getFullYear() &&
      pStart.getMonth() === currentDate.getMonth() &&
      pStart.getDate() === currentDate.getDate()
    );
  });

  const fullDateStr = currentDate.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="w-full rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-sm space-y-6">
      {/* Day Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-pink-500/10 text-pink-600 rounded-xl">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{fullDateStr}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {dayPlans.length} {dayPlans.length === 1 ? 'plan' : 'plans'} scheduled
            </p>
          </div>
        </div>

        {onAddPlanForDate && (
          <button
            type="button"
            onClick={() => onAddPlanForDate(currentDate)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-pink-600 hover:bg-pink-700 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Plan
          </button>
        )}
      </div>

      {/* Day Timeline */}
      <PlanTimeline
        plans={dayPlans}
        currentUserId={currentUserId}
        onToggleComplete={onToggleComplete}
        onEdit={onEdit}
        onDelete={onDelete}
        onSelectPlan={onSelectPlan}
      />
    </div>
  );
};
