export type ProposalStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'maybe'
  | 'countered'
  | 'expired'
  | 'cancelled'
  | 'completed';

export type ProposalCategory =
  | 'date'
  | 'trip'
  | 'activity'
  | 'dining'
  | 'getaway'
  | 'movie'
  | 'staycation'
  | 'custom';

export type ProposalPriority = 'low' | 'medium' | 'high';

export interface SpontaneousProposal {
  id: string;
  coupleId: string;
  senderId: string; // created_by
  receiverId?: string; // computed partner id
  title: string;
  description?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  coverImage?: string;
  proposedTime: string; // planned_date / start_datetime
  endDatetime?: string;
  status: ProposalStatus;
  acceptedAt?: string;
  declinedAt?: string;
  respondedAt?: string;
  responseNote?: string; // response_message
  parentProposalId?: string;
  visibility: 'couple' | 'private';
  category: ProposalCategory;
  estimatedCost?: number;
  dressCode?: string;
  weatherRequired?: string;
  isSurprise: boolean;
  autoAddToCalendar: boolean;
  reminderMinutes?: number;
  priority: ProposalPriority;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  // Dynamic fields
  commentsCount?: number;
  reactions?: ProposalReaction[];
  history?: SpontaneousProposal[];
}

export interface ProposalComment {
  id: string;
  proposalId: string;
  userId: string;
  content: string;
  parentId?: string | null;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  // Computed profile metadata
  userDisplayName?: string;
  userAvatarUrl?: string;
}

export interface ProposalReaction {
  id: string;
  proposalId: string;
  userId: string;
  emoji: string;
  createdAt: string;
  userDisplayName?: string;
}

export interface CreateProposalDTO {
  coupleId: string;
  senderId: string;
  title: string;
  description?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  coverImage?: string;
  proposedTime: string;
  endDatetime?: string;
  category?: ProposalCategory;
  estimatedCost?: number;
  dressCode?: string;
  weatherRequired?: string;
  isSurprise?: boolean;
  autoAddToCalendar?: boolean;
  reminderMinutes?: number;
  priority?: ProposalPriority;
  parentProposalId?: string;
}

export interface UpdateProposalDTO {
  title?: string;
  description?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  coverImage?: string;
  proposedTime?: string;
  endDatetime?: string;
  status?: ProposalStatus;
  responseNote?: string;
  category?: ProposalCategory;
  estimatedCost?: number;
  dressCode?: string;
  weatherRequired?: string;
  isSurprise?: boolean;
  autoAddToCalendar?: boolean;
  reminderMinutes?: number;
  priority?: ProposalPriority;
}

export interface CounterProposalDTO {
  proposalId: string;
  senderId: string;
  coupleId: string;
  title?: string;
  description?: string;
  proposedTime: string;
  endDatetime?: string;
  location?: string;
  responseNote: string;
}
