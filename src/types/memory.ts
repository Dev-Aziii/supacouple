export interface MemoryItem {
  id: string;
  coupleId?: string;
  title: string;
  description?: string | null;
  mediaUrls?: string[];
  eventDate: string;
  location?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
