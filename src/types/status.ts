export interface StatusUpdate {
  id: string;
  userId: string;
  mood?: string | null;
  statusMessage?: string | null;
  customStatus?: string | null;
  updatedAt: string;
}
