export type PlanCategory =
  | 'date'
  | 'dinner'
  | 'movie'
  | 'trip'
  | 'shopping'
  | 'anniversary'
  | 'birthday'
  | 'meeting'
  | 'workout'
  | 'study'
  | 'travel'
  | 'reminder'
  | 'custom';

export type PlanPriority = 'low' | 'medium' | 'high';

export type PlanRepeat = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export type PlanStatus = 'scheduled' | 'completed' | 'cancelled';

export interface PlanItem {
  id: string;
  coupleId: string;
  createdBy: string;
  title: string;
  description?: string;
  category: PlanCategory;
  priority: PlanPriority;
  color: string;
  completed: boolean;
  status: PlanStatus;
  startAt: string;
  endAt: string;
  location?: string;
  reminderMinutes?: number | null;
  repeat: PlanRepeat;
  createdAt: string;
  updatedAt: string;
  /** For virtual recurrence instances generated in memory */
  isVirtual?: boolean;
  originalPlanId?: string;
}
