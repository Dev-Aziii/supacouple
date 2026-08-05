import { MemoryItem } from '../../types/memory';

export interface IMemoryRepository {
  getAll(): Promise<MemoryItem[]>;
  getById(id: string): Promise<MemoryItem | null>;
  create(memory: Omit<MemoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<MemoryItem>;
  update(id: string, updates: Partial<MemoryItem>): Promise<MemoryItem>;
  delete(id: string): Promise<boolean>;
}

export class MemoryRepository implements IMemoryRepository {
  async getAll(): Promise<MemoryItem[]> {
    // Placeholder implementation - to be implemented with Supabase queries
    console.log('[MemoryRepository] getAll called');
    return [];
  }

  async getById(id: string): Promise<MemoryItem | null> {
    // Placeholder implementation - to be implemented with Supabase queries
    console.log('[MemoryRepository] getById called with id:', id);
    return null;
  }

  async create(memory: Omit<MemoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<MemoryItem> {
    // Placeholder implementation - to be implemented with Supabase queries
    console.log('[MemoryRepository] create called with:', memory);
    throw new Error('[MemoryRepository] create not implemented');
  }

  async update(id: string, updates: Partial<MemoryItem>): Promise<MemoryItem> {
    // Placeholder implementation - to be implemented with Supabase queries
    console.log('[MemoryRepository] update called with:', id, updates);
    throw new Error('[MemoryRepository] update not implemented');
  }

  async delete(id: string): Promise<boolean> {
    // Placeholder implementation - to be implemented with Supabase queries
    console.log('[MemoryRepository] delete called with:', id);
    return false;
  }
}

export const memoryRepository = new MemoryRepository();
