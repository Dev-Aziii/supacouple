export type ActivityType =
  | 'status_updated'
  | 'plan_created'
  | 'plan_completed'
  | 'proposal_created'
  | 'proposal_accepted'
  | 'proposal_declined'
  | 'memory_added'
  | 'memory_liked'
  | 'relationship_created'
  | 'relationship_ended'
  | 'system';

export interface ActivityMetadata {
  emoji?: string;
  expires_at?: string;
  plan_id?: string;
  start_at?: string;
  location?: string;
  proposal_id?: string;
  planned_date?: string;
  memory_id?: string;
  image_url?: string;
  memory_date?: string;
  [key: string]: unknown;
}

export interface ActivityItem {
  id: string;
  coupleId: string;
  userId: string;
  type: ActivityType;
  title: string;
  description?: string;
  metadata: ActivityMetadata;
  createdAt: string;
  isViewed?: boolean;
  userProfile?: {
    displayName: string;
    avatarUrl?: string;
  };
}

export interface CreateActivityDTO {
  coupleId: string;
  userId: string;
  type: ActivityType;
  title: string;
  description?: string;
  metadata?: ActivityMetadata;
}

export interface GroupedActivities {
  dateLabel: 'Today' | 'Yesterday' | string;
  activities: ActivityItem[];
}
