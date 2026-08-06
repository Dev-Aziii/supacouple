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
  onAddPlan?: () => void;
}

export const AgendaView: React.FC<AgendaViewProps> = ({
  plans,
  currentUserId,
  onToggleComplete,
  onEdit,
  onDelete,
  onSelectPlan,
  onAddPlan,
}) => {
  if (!plans.length) {
    return (
      <div className="w-full rounded-2xl border border-dashed border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-12 text-center space-y-3">
        <div className="w-14 h-14 rounded-full bg-pink-500/10 text-pink-500 flex items-center justify-center mx-auto">
          <CalendarIcon className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Plans Scheduled</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
          Your shared agenda is open. Coordinate date nights, trips, and activities together!
        </p>
        {onAddPlan && (
          <button
            onClick={onAddPlan}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-pink-600 hover:bg-pink-700 rounded-xl transition-all shadow-md shadow-pink-500/20"
          >
            + Create First Plan
          </button>
        )}
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
