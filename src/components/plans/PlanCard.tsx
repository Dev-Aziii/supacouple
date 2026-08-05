import React from 'react';
import type { PlanItem } from '../../types/plan';
import { CategoryBadge } from './CategoryBadge';
import { PriorityBadge } from './PriorityBadge';
import {
  Calendar,
  Clock,
  MapPin,
  Repeat,
  Bell,
  CheckCircle,
  Circle,
  Edit2,
  Trash2,
  User,
} from 'lucide-react';

interface PlanCardProps {
  plan: PlanItem;
  currentUserId?: string;
  onToggleComplete?: (plan: PlanItem) => void;
  onEdit?: (plan: PlanItem) => void;
  onDelete?: (plan: PlanItem) => void;
  onClick?: (plan: PlanItem) => void;
}

export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  currentUserId,
  onToggleComplete,
  onEdit,
  onDelete,
  onClick,
}) => {
  const startDate = new Date(plan.startAt);
  const endDate = new Date(plan.endAt);

  const dateStr = startDate.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const timeStr = `${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  const isCreator = currentUserId ? plan.createdBy === currentUserId : true;

  const getReminderLabel = (minutes?: number | null) => {
    if (!minutes) return null;
    if (minutes === 0) return 'At event time';
    if (minutes === 15) return '15 mins before';
    if (minutes === 30) return '30 mins before';
    if (minutes === 60) return '1 hour before';
    if (minutes === 1440) return '1 day before';
    return `${minutes} mins before`;
  };

  return (
    <div
      onClick={() => onClick?.(plan)}
      style={{ borderLeftColor: plan.color || '#ec4899' }}
      className={`group relative overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 border-l-4 shadow-sm hover:shadow-md transition-all duration-200 ${
        plan.completed ? 'opacity-75 bg-slate-50/50 dark:bg-slate-900/50' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete?.(plan);
            }}
            className="mt-0.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-full"
            aria-label={plan.completed ? 'Mark plan as incomplete' : 'Mark plan as complete'}
          >
            {plan.completed ? (
              <CheckCircle className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
          </button>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4
                className={`text-base font-semibold truncate ${
                  plan.completed
                    ? 'line-through text-slate-500 dark:text-slate-400'
                    : 'text-slate-900 dark:text-slate-100'
                }`}
              >
                {plan.title}
              </h4>
              {plan.isVirtual && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-indigo-500/10 text-indigo-500 rounded">
                  Recurring
                </span>
              )}
            </div>

            {plan.description && (
              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{plan.description}</p>
            )}

            <div className="flex items-center gap-3 pt-1 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {dateStr}
              </span>

              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {timeStr}
              </span>

              {plan.location && (
                <span className="inline-flex items-center gap-1 truncate max-w-[150px]">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="truncate">{plan.location}</span>
                </span>
              )}

              {plan.repeat !== 'none' && (
                <span className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                  <Repeat className="w-3.5 h-3.5" />
                  <span className="capitalize">{plan.repeat}</span>
                </span>
              )}

              {plan.reminderMinutes !== undefined && plan.reminderMinutes !== null && (
                <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <Bell className="w-3.5 h-3.5" />
                  <span>{getReminderLabel(plan.reminderMinutes)}</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2 flex-wrap">
              <CategoryBadge category={plan.category} size="sm" />
              <PriorityBadge priority={plan.priority} size="sm" />

              <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-slate-400">
                <User className="w-3 h-3" />
                {isCreator ? 'You' : 'Partner'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(plan);
              }}
              className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Edit Plan"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(plan);
              }}
              className="p-1.5 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
              title="Delete Plan"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
