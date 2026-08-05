export type PlanCategory = 'date' | 'trip' | 'activity' | 'anniversary' | 'movie' | 'other';
export type PlanStatus = 'idea' | 'scheduled' | 'completed' | 'cancelled';

export interface PlanItem {
  id: string;
  title: string;
  description?: string;
  category: PlanCategory;
  status: PlanStatus;
  scheduledDate?: string;
  location?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
