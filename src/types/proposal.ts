export type ProposalStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export interface SpontaneousProposal {
  id: string;
  senderId: string;
  receiverId: string;
  title: string;
  description?: string;
  location?: string;
  proposedTime?: string;
  status: ProposalStatus;
  responseNote?: string;
  createdAt: string;
  expiresAt: string;
}
