import React, { useState } from 'react';
import type { PlanItem, PlanCategory, PlanPriority, PlanRepeat } from '../../types/plan';
import type { CreatePlanDTO, UpdatePlanDTO } from '../../services/repositories/plansRepository';
import { Calendar, Clock, MapPin, Tag, AlertCircle, Bell, Repeat, Palette, FileText } from 'lucide-react';

interface PlanFormProps {
  initialValues?: Partial<PlanItem>;
  onSubmit: (dto: CreatePlanDTO | UpdatePlanDTO) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

const CATEGORY_OPTIONS: { value: PlanCategory; label: string }[] = [
  { value: 'date', label: 'Date' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'movie', label: 'Movie' },
  { value: 'trip', label: 'Trip' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'anniversary', label: 'Anniversary' },
  { value: 'birthday', label: 'Birthday' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'workout', label: 'Workout' },
  { value: 'study', label: 'Study' },
  { value: 'travel', label: 'Travel' },
  { value: 'reminder', label: 'Reminder' },
  { value: 'custom', label: 'Custom' },
];

const REPEAT_OPTIONS: { value: PlanRepeat; label: string }[] = [
  { value: 'none', label: 'Does not repeat' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

const REMINDER_OPTIONS: { value: number | null; label: string }[] = [
  { value: null, label: 'No reminder' },
  { value: 0, label: 'At time of event' },
  { value: 15, label: '15 minutes before' },
  { value: 30, label: '30 minutes before' },
  { value: 60, label: '1 hour before' },
  { value: 1440, label: '1 day before' },
];

const COLOR_PRESETS = [
  '#ec4899', // Pink (Default)
  '#f43f5e', // Rose
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#d946ef', // Fuchsia
];

export const PlanForm: React.FC<PlanFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const formatForDatetimeLocal = (isoString?: string) => {
    const d = isoString ? new Date(isoString) : new Date();
    // Round up to next hour if creating new
    if (!isoString) {
      d.setMinutes(0, 0, 0);
      d.setHours(d.getHours() + 1);
    }
    const tzOffset = d.getTimezoneOffset() * 60000;
    const localISOTime = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
    return localISOTime;
  };

  const formatForEndDatetimeLocal = (startIso: string) => {
    const d = new Date(startIso);
    d.setHours(d.getHours() + 1);
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  const defaultStart = formatForDatetimeLocal(initialValues?.startAt);
  const defaultEnd = initialValues?.endAt
    ? formatForDatetimeLocal(initialValues.endAt)
    : formatForEndDatetimeLocal(new Date(defaultStart).toISOString());

  const [title, setTitle] = useState(initialValues?.title || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [category, setCategory] = useState<PlanCategory>(initialValues?.category || 'date');
  const [priority, setPriority] = useState<PlanPriority>(initialValues?.priority || 'medium');
  const [location, setLocation] = useState(initialValues?.location || '');
  const [startAt, setStartAt] = useState(defaultStart);
  const [endAt, setEndAt] = useState(defaultEnd);
  const [reminderMinutes, setReminderMinutes] = useState<number | null>(
    initialValues?.reminderMinutes !== undefined ? initialValues.reminderMinutes : 15
  );
  const [repeat, setRepeat] = useState<PlanRepeat>(initialValues?.repeat || 'none');
  const [color, setColor] = useState(initialValues?.color || '#ec4899');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    const startDate = new Date(startAt);
    const endDate = new Date(endAt);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      setError('Please provide valid start and end dates');
      return;
    }

    if (endDate < startDate) {
      setError('End time cannot be earlier than start time');
      return;
    }

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        priority,
        location: location.trim() || undefined,
        startAt: startDate.toISOString(),
        endAt: endDate.toISOString(),
        reminderMinutes,
        repeat,
        color,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed saving plan';
      setError(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-xs rounded-lg bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Plan Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Candlelight Dinner at Mario's"
          required
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-pink-500 focus:outline-none"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          Description / Notes
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Add details, reservations, or notes..."
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-pink-500 focus:outline-none resize-none"
        />
      </div>

      {/* Category & Priority Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as PlanCategory)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-pink-500 focus:outline-none"
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
            Priority
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as PlanPriority)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-pink-500 focus:outline-none"
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          Location
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Central Park / 123 Main St"
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-pink-500 focus:outline-none"
        />
      </div>

      {/* Start & End Times */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Start Date & Time *
          </label>
          <input
            type="datetime-local"
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
            required
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-pink-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            End Date & Time *
          </label>
          <input
            type="datetime-local"
            value={endAt}
            onChange={(e) => setEndAt(e.target.value)}
            required
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-pink-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Reminder & Repeat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
            <Bell className="w-3.5 h-3.5 text-slate-400" />
            Reminder
          </label>
          <select
            value={reminderMinutes === null ? '' : reminderMinutes}
            onChange={(e) => setReminderMinutes(e.target.value === '' ? null : Number(e.target.value))}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-pink-500 focus:outline-none"
          >
            {REMINDER_OPTIONS.map((opt, idx) => (
              <option key={idx} value={opt.value === null ? '' : opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
            <Repeat className="w-3.5 h-3.5 text-slate-400" />
            Repeat
          </label>
          <select
            value={repeat}
            onChange={(e) => setRepeat(e.target.value as PlanRepeat)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-pink-500 focus:outline-none"
          >
            {REPEAT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Color Accent Picker */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
          <Palette className="w-3.5 h-3.5 text-slate-400" />
          Color Tag
        </label>
        <div className="flex items-center gap-2 flex-wrap">
          {COLOR_PRESETS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              style={{ backgroundColor: c }}
              className={`w-6 h-6 rounded-full transition-transform ${
                color === c ? 'ring-2 ring-offset-2 ring-slate-800 dark:ring-slate-100 scale-110' : 'opacity-80 hover:opacity-100'
              }`}
              aria-label={`Select color ${c}`}
            />
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2 text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 rounded-lg shadow-sm disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? 'Saving...' : initialValues?.id ? 'Update Plan' : 'Create Plan'}
        </button>
      </div>
    </form>
  );
};
