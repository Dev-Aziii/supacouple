import React from 'react';
import type { PlanItem } from '../../types/plan';
import { PlanChip } from './PlanChip';
import { Plus } from 'lucide-react';

interface WeekViewProps {
  currentDate: Date;
  plans: PlanItem[];
  onSelectPlan: (plan: PlanItem) => void;
  onSelectDate: (date: Date) => void;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const WeekView: React.FC<WeekViewProps> = ({
  currentDate,
  plans,
  onSelectPlan,
  onSelectDate,
}) => {
  // Compute start of week (Sunday)
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const weekDays: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    weekDays.push(d);
  }

  const today = new Date();

  const getPlansForDate = (date: Date) => {
    return plans.filter((plan) => {
      const pStart = new Date(plan.startAt);
      return (
        pStart.getFullYear() === date.getFullYear() &&
        pStart.getMonth() === date.getMonth() &&
        pStart.getDate() === date.getDate()
      );
    });
  };

  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      {/* 7-day Column Grid */}
      <div className="grid grid-cols-7 divide-x divide-slate-200 dark:divide-slate-800">
        {weekDays.map((dayDate, idx) => {
          const isToday =
            today.getFullYear() === dayDate.getFullYear() &&
            today.getMonth() === dayDate.getMonth() &&
            today.getDate() === dayDate.getDate();

          const dayPlans = getPlansForDate(dayDate);

          return (
            <div
              key={idx}
              className={`min-h-[350px] p-2 flex flex-col justify-between ${
                isToday ? 'bg-pink-500/5 dark:bg-pink-500/10' : ''
              }`}
            >
              {/* Header */}
              <div className="text-center pb-3 border-b border-slate-100 dark:border-slate-800/80">
                <span className="block text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400">
                  {DAYS_OF_WEEK[dayDate.getDay()]}
                </span>
                <span
                  className={`inline-flex items-center justify-center w-7 h-7 text-sm font-bold rounded-full mt-1 ${
                    isToday ? 'bg-pink-600 text-white shadow' : 'text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {dayDate.getDate()}
                </span>
              </div>

              {/* Plans Column List */}
              <div className="flex-1 py-2 space-y-1.5 overflow-y-auto">
                {dayPlans.map((plan) => (
                  <PlanChip key={plan.id} plan={plan} onClick={onSelectPlan} />
                ))}

                {!dayPlans.length && (
                  <div className="text-[11px] text-center text-slate-400 dark:text-slate-600 py-6">
                    No plans
                  </div>
                )}
              </div>

              {/* Quick Add Button */}
              <button
                type="button"
                onClick={() => onSelectDate(dayDate)}
                className="w-full mt-2 py-1.5 text-xs text-slate-500 hover:text-pink-600 dark:text-slate-400 dark:hover:text-pink-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-center gap-1 hover:border-pink-300 dark:hover:border-pink-800 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
