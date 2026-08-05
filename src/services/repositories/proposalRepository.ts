import { SpontaneousProposal } from '../../types/proposal';

export interface IProposalRepository {
  getAll(): Promise<SpontaneousProposal[]>;
  getById(id: string): Promise<SpontaneousProposal | null>;
  create(proposal: Omit<SpontaneousProposal, 'id' | 'createdAt'>): Promise<SpontaneousProposal>;
  update(id: string, updates: Partial<SpontaneousProposal>): Promise<SpontaneousProposal>;
  delete(id: string): Promise<boolean>;
}

export class ProposalRepository implements IProposalRepository {
  async getAll(): Promise<SpontaneousProposal[]> {
    // Placeholder implementation - to be implemented with Supabase queries
    console.log('[ProposalRepository] getAll called');
    return [];
  }

  async getById(id: string): Promise<SpontaneousProposal | null> {
    // Placeholder implementation - to be implemented with Supabase queries
    console.log('[ProposalRepository] getById called with id:', id);
    return null;
  }

  async create(proposal: Omit<SpontaneousProposal, 'id' | 'createdAt'>): Promise<SpontaneousProposal> {
    // Placeholder implementation - to be implemented with Supabase queries
    console.log('[ProposalRepository] create called with:', proposal);
    throw new Error('[ProposalRepository] create not implemented');
  }

  async update(id: string, updates: Partial<SpontaneousProposal>): Promise<SpontaneousProposal> {
    // Placeholder implementation - to be implemented with Supabase queries
    console.log('[ProposalRepository] update called with:', id, updates);
    throw new Error('[ProposalRepository] update not implemented');
  }

  async delete(id: string): Promise<boolean> {
    // Placeholder implementation - to be implemented with Supabase queries
    console.log('[ProposalRepository] delete called with:', id);
    return false;
  }
}

export const proposalRepository = new ProposalRepository();
