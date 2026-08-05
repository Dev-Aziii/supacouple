import { StatusUpdate } from '../../types/status';

export interface IStatusRepository {
  getLatestStatus(userId: string): Promise<StatusUpdate | null>;
  createStatus(status: Omit<StatusUpdate, 'id' | 'updatedAt'>): Promise<StatusUpdate>;
  updateStatus(id: string, updates: Partial<StatusUpdate>): Promise<StatusUpdate>;
  deleteStatus(id: string): Promise<boolean>;
}

export class StatusRepository implements IStatusRepository {
  async getLatestStatus(userId: string): Promise<StatusUpdate | null> {
    // Placeholder implementation - to be implemented with Supabase queries
    console.log('[StatusRepository] getLatestStatus called for userId:', userId);
    return null;
  }

  async createStatus(status: Omit<StatusUpdate, 'id' | 'updatedAt'>): Promise<StatusUpdate> {
    // Placeholder implementation - to be implemented with Supabase queries
    console.log('[StatusRepository] createStatus called with:', status);
    throw new Error('[StatusRepository] createStatus not implemented');
  }

  async updateStatus(id: string, updates: Partial<StatusUpdate>): Promise<StatusUpdate> {
    // Placeholder implementation - to be implemented with Supabase queries
    console.log('[StatusRepository] updateStatus called with:', id, updates);
    throw new Error('[StatusRepository] updateStatus not implemented');
  }

  async deleteStatus(id: string): Promise<boolean> {
    // Placeholder implementation - to be implemented with Supabase queries
    console.log('[StatusRepository] deleteStatus called with:', id);
    return false;
  }
}

export const statusRepository = new StatusRepository();
