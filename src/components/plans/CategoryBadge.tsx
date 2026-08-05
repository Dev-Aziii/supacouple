import React from 'react';
import type { PlanCategory } from '../../types/plan';
import {
  Heart,
  Utensils,
  Film,
  Plane,
  ShoppingBag,
  Gift,
  Cake,
  Briefcase,
  Dumbbell,
  BookOpen,
  MapPin,
  Bell,
  Sparkles,
} from 'lucide-react';

interface CategoryBadgeProps {
  category: PlanCategory;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const CATEGORY_CONFIG: Record<
  PlanCategory,
  { label: string; icon: React.ComponentType<{ className?: string }>; bgClass: string; textClass: string }
> = {
  date: { label: 'Date', icon: Heart, bgClass: 'bg-pink-500/15', textClass: 'text-pink-600 dark:text-pink-400' },
  dinner: { label: 'Dinner', icon: Utensils, bgClass: 'bg-amber-500/15', textClass: 'text-amber-600 dark:text-amber-400' },
  movie: { label: 'Movie', icon: Film, bgClass: 'bg-purple-500/15', textClass: 'text-purple-600 dark:text-purple-400' },
  trip: { label: 'Trip', icon: Plane, bgClass: 'bg-blue-500/15', textClass: 'text-blue-600 dark:text-blue-400' },
  shopping: { label: 'Shopping', icon: ShoppingBag, bgClass: 'bg-emerald-500/15', textClass: 'text-emerald-600 dark:text-emerald-400' },
  anniversary: { label: 'Anniversary', icon: Gift, bgClass: 'bg-rose-500/15', textClass: 'text-rose-600 dark:text-rose-400' },
  birthday: { label: 'Birthday', icon: Cake, bgClass: 'bg-red-500/15', textClass: 'text-red-600 dark:text-red-400' },
  meeting: { label: 'Meeting', icon: Briefcase, bgClass: 'bg-slate-500/15', textClass: 'text-slate-600 dark:text-slate-400' },
  workout: { label: 'Workout', icon: Dumbbell, bgClass: 'bg-orange-500/15', textClass: 'text-orange-600 dark:text-orange-400' },
  study: { label: 'Study', icon: BookOpen, bgClass: 'bg-indigo-500/15', textClass: 'text-indigo-600 dark:text-indigo-400' },
  travel: { label: 'Travel', icon: MapPin, bgClass: 'bg-cyan-500/15', textClass: 'text-cyan-600 dark:text-cyan-400' },
  reminder: { label: 'Reminder', icon: Bell, bgClass: 'bg-yellow-500/15', textClass: 'text-yellow-600 dark:text-yellow-400' },
  custom: { label: 'Custom', icon: Sparkles, bgClass: 'bg-violet-500/15', textClass: 'text-violet-600 dark:text-violet-400' },
};

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, className = '', size = 'md' }) => {
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.custom;
  const Icon = config.icon;

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs gap-1'
      : size === 'lg'
      ? 'px-3.5 py-1.5 text-sm gap-2'
      : 'px-2.5 py-1 text-xs gap-1.5';

  const iconSizes = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5';

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium transition-colors ${config.bgClass} ${config.textClass} ${sizeClasses} ${className}`}
    >
      <Icon className={iconSizes} />
      <span>{config.label}</span>
    </span>
  );
};
