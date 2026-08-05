export interface MemoryItem {
  id: string;
  coupleId: string;
  createdBy: string;
  title: string;
  caption?: string | null;
  description?: string | null;
  coverImage?: string | null;
  mediaUrls: string[];
  eventDate: string;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  albumId?: string | null;
  isFavorite: boolean;
  isPrivate: boolean;
  visibility: 'couple' | 'private' | 'public';
  weather?: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  // Computed / expanded relations
  commentsCount?: number;
  reactionsCount?: number;
  userReaction?: string | null;
}

export interface MemoryAlbum {
  id: string;
  coupleId: string;
  title: string;
  description?: string | null;
  coverImage?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  memoriesCount?: number;
}

export interface MemoryComment {
  id: string;
  memoryId: string;
  parentCommentId?: string | null;
  userId: string;
  content: string;
  edited: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  // Computed / user profile details
  userName?: string;
  userAvatar?: string;
  replies?: MemoryComment[];
}

export interface MemoryReaction {
  id: string;
  memoryId: string;
  userId: string;
  emoji: string;
  createdAt: string;
  userName?: string;
}

export type MilestoneType =
  | 'First Date'
  | 'First Trip'
  | 'Anniversary'
  | 'Moved In'
  | 'Proposal'
  | 'Wedding'
  | 'Vacation'
  | 'Custom';

export interface RelationshipMilestone {
  id: string;
  coupleId: string;
  title: string;
  description?: string | null;
  date: string;
  type: MilestoneType | string;
  coverImage?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type TimelineEventType = 'memory' | 'milestone' | 'plan' | 'proposal' | 'status';

export interface TimelineItem {
  id: string;
  type: TimelineEventType;
  date: string;
  title: string;
  description?: string | null;
  coverImage?: string | null;
  location?: string | null;
  tags?: string[];
  rawItem: unknown;
}

export interface CreateMemoryDTO {
  coupleId: string;
  createdBy: string;
  title: string;
  caption?: string;
  description?: string;
  coverImage?: string;
  mediaUrls?: string[];
  eventDate?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  albumId?: string;
  isFavorite?: boolean;
  isPrivate?: boolean;
  visibility?: 'couple' | 'private' | 'public';
  weather?: string;
  tags?: string[];
}

export interface CreateAlbumDTO {
  coupleId: string;
  createdBy: string;
  title: string;
  description?: string;
  coverImage?: string;
}

export interface CreateMilestoneDTO {
  coupleId: string;
  createdBy: string;
  title: string;
  description?: string;
  date: string;
  type: MilestoneType | string;
  coverImage?: string;
}
