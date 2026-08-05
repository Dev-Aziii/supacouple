export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  partnerId?: string | null;
  partnerName?: string | null;
  avatarUrl?: string | null;
  statusMessage?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CouplePair {
  id: string;
  user1Id: string;
  user2Id: string;
  anniversaryDate?: string;
  relationshipStatus: 'connected' | 'pending' | 'single';
}
