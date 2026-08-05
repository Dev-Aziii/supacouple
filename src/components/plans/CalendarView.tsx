import React, { useState } from 'react';
import type { PlanItem, PlanCategory, PlanPriority } from '../../types/plan';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { DayView } from './DayView';
import { AgendaView } from './AgendaView';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  LayoutGrid,
  CalendarDays,
  ListFilter,
  Clock,
} from 'lucide-react';

export type CalendarViewMode = 'month' | 'week' | 'day' | 'agenda';

interface CalendarViewProps {
  plans: PlanItem[];
  currentUserId?: string;
  currentDate: Date;
  onDateChange: (newDate: Date) => void;
  onToggleComplete?: (plan: PlanItem) => void;
  onEdit?: (plan: PlanItem) => void;
  onDelete?: (plan: PlanItem) => void;
  onSelectPlan?: (plan: PlanItem) => void;
  onAddPlan: (initialDate?: Date) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  plans,
  currentUserId,
  currentDate,
  onDateChange,
  onToggleComplete,
  onEdit,
  onDelete,
  onSelectPlan,
  onAddPlan,
}) => {
  // Adaptive view default: Agenda on small screens (<640px), Month on desktop
  const [viewMode, setViewMode] = useState<CalendarViewMode>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      return 'agenda';
    }
    return 'month';
  });

  // Filter States (Step 14)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PlanCategory | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<PlanPriority | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'completed'>('all');

  // Navigation Handlers (Step 13)
  const handlePrev = () => {
    const nextDate = new Date(currentDate);
    if (viewMode === 'month') {
      nextDate.setMonth(nextDate.getMonth() - 1);
    } else if (viewMode === 'week') {
      nextDate.setDate(nextDate.getDate() - 7);
    } else {
      nextDate.setDate(nextDate.getDate() - 1);
    }
    onDateChange(nextDate);
  };

  const handleNext = () => {
    const nextDate = new Date(currentDate);
    if (viewMode === 'month') {
      nextDate.setMonth(nextDate.getMonth() + 1);
    } else if (viewMode === 'week') {
      nextDate.setDate(nextDate.getDate() + 7);
    } else {
      nextDate.setDate(nextDate.getDate() + 1);
    }
    onDateChange(nextDate);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  // Header Title
  const headerTitle =
    viewMode === 'month'
      ? currentDate.toLocaleDateString([], { month: 'long', year: 'numeric' })
      : viewMode === 'week'
      ? `Week of ${currentDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}`
      : currentDate.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });

  // Apply Filters
  const filteredPlans = plans.filter((plan) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = plan.title.toLowerCase().includes(q);
      const matchDesc = plan.description?.toLowerCase().includes(q);
      const matchLoc = plan.location?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchLoc) return false;
    }

    // Category
    if (selectedCategory !== 'all' && plan.category !== selectedCategory) {
      return false;
    }

    // Priority
    if (selectedPriority !== 'all' && plan.priority !== selectedPriority) {
      return false;
    }

    // Status filter
    if (statusFilter === 'completed' && !plan.completed) return false;
    if (statusFilter === 'upcoming' && plan.completed) return false;

    return true;
  });

  return (
    <div className="space-y-4">
      {/* Top Header Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        {/* Date Navigation & Jump to Today */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToday}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Today
          </button>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrev}
              className="p-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Previous period"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="p-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Next period"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 ml-2">
            {headerTitle}
          </h2>
        </div>

        {/* Right side controls: View Mode switcher & Add Plan button */}
        <div className="flex items-center gap-2 justify-between md:justify-end flex-wrap">
          {/* View Switcher Tabs */}
          <div className="inline-flex items-center p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium">
            <button
              type="button"
              onClick={() => setViewMode('month')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                viewMode === 'month'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Month
            </button>

            <button
              type="button"
              onClick={() => setViewMode('week')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                viewMode === 'week'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              Week
            </button>

            <button
              type="button"
              onClick={() => setViewMode('day')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                viewMode === 'day'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Day
            </button>

            <button
              type="button"
              onClick={() => setViewMode('agenda')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                viewMode === 'agenda'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              Agenda
            </button>
          </div>

          <button
            type="button"
            onClick={() => onAddPlan(currentDate)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-pink-600 hover:bg-pink-700 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Plan</span>
          </button>
        </div>
      </div>

      {/* Filter Bar (Step 14) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search plans by title, description, or location..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-pink-500 focus:outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as PlanCategory | 'all')}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="date">Date</option>
            <option value="dinner">Dinner</option>
            <option value="movie">Movie</option>
            <option value="trip">Trip</option>
            <option value="shopping">Shopping</option>
            <option value="anniversary">Anniversary</option>
            <option value="birthday">Birthday</option>
            <option value="meeting">Meeting</option>
            <option value="workout">Workout</option>
            <option value="study">Study</option>
            <option value="travel">Travel</option>
            <option value="reminder">Reminder</option>
            <option value="custom">Custom</option>
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value as PlanPriority | 'all')}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'upcoming' | 'completed')}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'month' && (
        <MonthView
          currentDate={currentDate}
          plans={filteredPlans}
          onSelectPlan={(p) => onSelectPlan?.(p)}
          onSelectDate={(d) => onAddPlan(d)}
        />
      )}

      {viewMode === 'week' && (
        <WeekView
          currentDate={currentDate}
          plans={filteredPlans}
          onSelectPlan={(p) => onSelectPlan?.(p)}
          onSelectDate={(d) => onAddPlan(d)}
        />
      )}

      {viewMode === 'day' && (
        <DayView
          currentDate={currentDate}
          plans={filteredPlans}
          currentUserId={currentUserId}
          onToggleComplete={onToggleComplete}
          onEdit={onEdit}
          onDelete={onDelete}
          onSelectPlan={onSelectPlan}
          onAddPlanForDate={(d) => onAddPlan(d)}
        />
      )}

      {viewMode === 'agenda' && (
        <AgendaView
          plans={filteredPlans}
          currentUserId={currentUserId}
          onToggleComplete={onToggleComplete}
          onEdit={onEdit}
          onDelete={onDelete}
          onSelectPlan={onSelectPlan}
        />
      )}
    </div>
  );
};
