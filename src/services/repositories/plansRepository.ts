import { PlanItem } from '../../types/plan';

export interface IPlansRepository {
  getAll(): Promise<PlanItem[]>;
  getById(id: string): Promise<PlanItem | null>;
  create(plan: Omit<PlanItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<PlanItem>;
  update(id: string, updates: Partial<PlanItem>): Promise<PlanItem>;
  delete(id: string): Promise<boolean>;
}

export class PlansRepository implements IPlansRepository {
  async getAll(): Promise<PlanItem[]> {
    // Placeholder implementation - to be implemented with Supabase queries
    console.log('[PlansRepository] getAll called');
    return [];
  }

  async getById(id: string): Promise<PlanItem | null> {
    // Placeholder implementation - to be implemented with Supabase queries
    console.log('[PlansRepository] getById called with id:', id);
    return null;
  }

  async create(plan: Omit<PlanItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<PlanItem> {
    // Placeholder implementation - to be implemented with Supabase queries
    console.log('[PlansRepository] create called with:', plan);
    throw new Error('[PlansRepository] create not implemented');
  }

  async update(id: string, updates: Partial<PlanItem>): Promise<PlanItem> {
    // Placeholder implementation - to be implemented with Supabase queries
    console.log('[PlansRepository] update called with:', id, updates);
    throw new Error('[PlansRepository] update not implemented');
  }

  async delete(id: string): Promise<boolean> {
    // Placeholder implementation - to be implemented with Supabase queries
    console.log('[PlansRepository] delete called with:', id);
    return false;
  }
}

export const plansRepository = new PlansRepository();
