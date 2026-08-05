import React from 'react';
import type { PlanItem } from '../../types/plan';
import { PlanCard } from './PlanCard';
import { Clock } from 'lucide-react';

interface PlanTimelineProps {
  plans: PlanItem[];
  currentUserId?: string;
  onToggleComplete?: (plan: PlanItem) => void;
  onEdit?: (plan: PlanItem) => void;
  onDelete?: (plan: PlanItem) => void;
  onSelectPlan?: (plan: PlanItem) => void;
}

export const PlanTimeline: React.FC<PlanTimelineProps> = ({
  plans,
  currentUserId,
  onToggleComplete,
  onEdit,
  onDelete,
  onSelectPlan,
}) => {
  if (!plans.length) {
    return (
      <div className="text-center py-10 text-slate-400 dark:text-slate-500">
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm font-medium">No plans scheduled for this period.</p>
      </div>
    );
  }

  // Sort plans by start time
  const sortedPlans = [...plans].sort(
    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
  );

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
      {sortedPlans.map((plan) => {
        const startDate = new Date(plan.startAt);
        const timeStr = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return (
          <div key={plan.id} className="relative group">
            {/* Timeline Dot */}
            <div
              style={{ backgroundColor: plan.color || '#ec4899' }}
              className="absolute -left-6 top-4 w-3.5 h-3.5 rounded-full ring-4 ring-white dark:ring-slate-900 group-hover:scale-125 transition-transform"
            />

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              <span>{timeStr}</span>
            </div>

            <PlanCard
              plan={plan}
              currentUserId={currentUserId}
              onToggleComplete={onToggleComplete}
              onEdit={onEdit}
              onDelete={onDelete}
              onClick={onSelectPlan}
            />
          </div>
        );
      })}
    </div>
  );
};
