import React from 'react';
import type { PlanItem } from '../../types/plan';
import { PlanChip } from './PlanChip';
import { Plus } from 'lucide-react';

interface MonthViewProps {
  currentDate: Date;
  plans: PlanItem[];
  onSelectPlan: (plan: PlanItem) => void;
  onSelectDate: (date: Date) => void;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const MonthView: React.FC<MonthViewProps> = ({
  currentDate,
  plans,
  onSelectPlan,
  onSelectDate,
}) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const prevMonthLastDay = new Date(year, month, 0).getDate();

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  // Build grid cells (42 cells: 6 rows of 7 days)
  const cells: { date: Date; isCurrentMonth: boolean; isToday: boolean }[] = [];

  // Previous month padding days
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthLastDay - i);
    cells.push({ date: d, isCurrentMonth: false, isToday: false });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    const isToday = isCurrentMonth && today.getDate() === day;
    cells.push({ date: d, isCurrentMonth: true, isToday });
  }

  // Next month padding days to fill 35 or 42 cells
  const remainingCells = (7 - (cells.length % 7)) % 7;
  for (let i = 1; i <= remainingCells; i++) {
    const d = new Date(year, month + 1, i);
    cells.push({ date: d, isCurrentMonth: false, isToday: false });
  }

  // Helper to filter plans falling on a specific date
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
      {/* Weekday Header */}
      <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850 text-center text-xs font-semibold text-slate-600 dark:text-slate-400">
        {DAYS_OF_WEEK.map((day) => (
          <div key={day} className="py-2.5">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 dark:divide-slate-800/60">
        {cells.map((cell, idx) => {
          const datePlans = getPlansForDate(cell.date);

          return (
            <div
              key={idx}
              onClick={() => onSelectDate(cell.date)}
              className={`group min-h-[90px] sm:min-h-[110px] p-1.5 flex flex-col justify-between transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer ${
                !cell.isCurrentMonth ? 'bg-slate-50/30 dark:bg-slate-950/20 text-slate-400 dark:text-slate-600' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`inline-flex items-center justify-center w-6 h-6 text-xs font-semibold rounded-full ${
                    cell.isToday
                      ? 'bg-pink-600 text-white font-bold shadow'
                      : cell.isCurrentMonth
                      ? 'text-slate-700 dark:text-slate-300'
                      : 'text-slate-400 dark:text-slate-600'
                  }`}
                >
                  {cell.date.getDate()}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectDate(cell.date);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-pink-600 rounded transition-opacity"
                  title="Add plan on this date"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Plan Chips List */}
              <div className="space-y-1 overflow-y-auto max-h-[70px] sm:max-h-[85px] scrollbar-none">
                {datePlans.slice(0, 3).map((plan) => (
                  <PlanChip key={plan.id} plan={plan} onClick={onSelectPlan} />
                ))}
                {datePlans.length > 3 && (
                  <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 pl-1">
                    +{datePlans.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
