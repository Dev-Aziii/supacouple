import React from 'react';
import type { PlanItem } from '../../types/plan';
import { PlanCard } from './PlanCard';
import { Calendar as CalendarIcon } from 'lucide-react';

interface AgendaViewProps {
  plans: PlanItem[];
  currentUserId?: string;
  onToggleComplete?: (plan: PlanItem) => void;
  onEdit?: (plan: PlanItem) => void;
  onDelete?: (plan: PlanItem) => void;
  onSelectPlan?: (plan: PlanItem) => void;
}

export const AgendaView: React.FC<AgendaViewProps> = ({
  plans,
  currentUserId,
  onToggleComplete,
  onEdit,
  onDelete,
  onSelectPlan,
}) => {
  if (!plans.length) {
    return (
      <div className="w-full rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center text-slate-400 dark:text-slate-500">
        <CalendarIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
        <p className="text-sm font-medium">No plans in agenda for this view.</p>
      </div>
    );
  }

  // Sort plans by start date
  const sortedPlans = [...plans].sort(
    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
  );

  // Group plans by date string (YYYY-MM-DD)
  const grouped = sortedPlans.reduce<Record<string, PlanItem[]>>((acc, plan) => {
    const key = new Date(plan.startAt).toISOString().split('T')[0];
    if (!acc[key]) acc[key] = [];
    acc[key].push(plan);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([dateStr, datePlans]) => {
        const dateObj = new Date(dateStr);
        const headerStr = dateObj.toLocaleDateString([], {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });

        const isToday =
          new Date().toISOString().split('T')[0] === dateStr;

        return (
          <div key={dateStr} className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-200 dark:border-slate-800">
              <span
                className={`text-sm font-bold ${
                  isToday ? 'text-pink-600 dark:text-pink-400' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                {headerStr}
              </span>
              {isToday && (
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-600">
                  Today
                </span>
              )}
            </div>

            <div className="space-y-3">
              {datePlans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  currentUserId={currentUserId}
                  onToggleComplete={onToggleComplete}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onClick={onSelectPlan}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
