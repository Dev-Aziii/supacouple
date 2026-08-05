import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { memoryRepository } from '../services/repositories/memoryRepository';
import { memoryService } from '../services/memories/memoryService';
import { plansRepository } from '../services/repositories/plansRepository';
import { proposalRepository } from '../services/repositories/proposalRepository';
import { statusRepository } from '../services/repositories/statusRepository';
import type {
  MemoryItem,
  RelationshipMilestone,
  CreateMemoryDTO,
  CreateAlbumDTO,
  CreateMilestoneDTO,
  TimelineItem,
} from '../types/memory';
import type { PlanItem } from '../types/plan';
import type { SpontaneousProposal } from '../types/proposal';
import type { StatusUpdate } from '../types/status';

// Query Keys
export const MEMORY_KEYS = {
  all: ['memories'] as const,
  list: (coupleId: string) => [...MEMORY_KEYS.all, 'list', coupleId] as const,
  paginated: (coupleId: string, page: number, filters: unknown) =>
    [...MEMORY_KEYS.all, 'paginated', coupleId, page, filters] as const,
  detail: (id: string) => [...MEMORY_KEYS.all, 'detail', id] as const,
  albums: (coupleId: string) => [...MEMORY_KEYS.all, 'albums', coupleId] as const,
  comments: (memoryId: string) => [...MEMORY_KEYS.all, 'comments', memoryId] as const,
  reactions: (memoryId: string) => [...MEMORY_KEYS.all, 'reactions', memoryId] as const,
  milestones: (coupleId: string) => [...MEMORY_KEYS.all, 'milestones', coupleId] as const,
  onThisDay: (coupleId: string) => [...MEMORY_KEYS.all, 'onThisDay', coupleId] as const,
  timeline: (coupleId: string) => [...MEMORY_KEYS.all, 'timeline', coupleId] as const,
};

export function useMemories(coupleId?: string) {
  return useQuery({
    queryKey: MEMORY_KEYS.list(coupleId || ''),
    queryFn: () => (coupleId ? memoryRepository.list(coupleId) : []),
    enabled: !!coupleId,
    staleTime: 1000 * 60 * 5,
  });
}

export function usePaginatedMemories(
  coupleId?: string,
  page = 1,
  limit = 12,
  filters?: { albumId?: string; isFavorite?: boolean; search?: string; tag?: string }
) {
  return useQuery({
    queryKey: MEMORY_KEYS.paginated(coupleId || '', page, filters),
    queryFn: () => (coupleId ? memoryRepository.paginate(coupleId, page, limit, filters) : { data: [], hasMore: false, page }),
    enabled: !!coupleId,
  });
}

export function useMemoryDetail(memoryId?: string) {
  return useQuery({
    queryKey: MEMORY_KEYS.detail(memoryId || ''),
    queryFn: () => (memoryId ? memoryRepository.getById(memoryId) : null),
    enabled: !!memoryId,
  });
}

export function useAlbums(coupleId?: string) {
  return useQuery({
    queryKey: MEMORY_KEYS.albums(coupleId || ''),
    queryFn: () => (coupleId ? memoryRepository.albums(coupleId) : []),
    enabled: !!coupleId,
  });
}

export function useComments(memoryId?: string) {
  return useQuery({
    queryKey: MEMORY_KEYS.comments(memoryId || ''),
    queryFn: () => (memoryId ? memoryRepository.comments(memoryId) : []),
    enabled: !!memoryId,
  });
}

export function useReactions(memoryId?: string) {
  return useQuery({
    queryKey: MEMORY_KEYS.reactions(memoryId || ''),
    queryFn: () => (memoryId ? memoryRepository.reactions(memoryId) : []),
    enabled: !!memoryId,
  });
}

export function useMilestones(coupleId?: string) {
  return useQuery({
    queryKey: MEMORY_KEYS.milestones(coupleId || ''),
    queryFn: () => (coupleId ? memoryRepository.milestones(coupleId) : []),
    enabled: !!coupleId,
  });
}

export function useOnThisDayMemories(coupleId?: string) {
  return useQuery({
    queryKey: MEMORY_KEYS.onThisDay(coupleId || ''),
    queryFn: async () => {
      if (!coupleId) return [];
      const all = await memoryRepository.list(coupleId);
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentDate = today.getDate();

      return all.filter((m) => {
        const d = new Date(m.eventDate);
        return d.getMonth() === currentMonth && d.getDate() === currentDate && d.getFullYear() !== today.getFullYear();
      });
    },
    enabled: !!coupleId,
  });
}

/**
 * Unified Relationship Timeline Query across Memories, Milestones, Plans, Accepted Proposals, and Status Updates.
 */
export function useRelationshipTimeline(coupleId?: string) {
  return useQuery({
    queryKey: MEMORY_KEYS.timeline(coupleId || ''),
    queryFn: async () => {
      if (!coupleId) return [];

      const [memories, milestones, plans, proposals, statuses] = await Promise.all([
        memoryRepository.list(coupleId),
        memoryRepository.milestones(coupleId),
        plansRepository.getByCoupleId(coupleId),
        proposalRepository.getByCoupleId(coupleId),
        statusRepository.getByCoupleId(coupleId),
      ]);

      const timelineItems: TimelineItem[] = [];

      memories.forEach((m: MemoryItem) => {
        timelineItems.push({
          id: `mem-${m.id}`,
          type: 'memory',
          date: m.eventDate || m.createdAt,
          title: m.title,
          description: m.caption || m.description,
          coverImage: m.coverImage || m.mediaUrls[0],
          location: m.location,
          tags: m.tags,
          rawItem: m,
        });
      });

      milestones.forEach((ms: RelationshipMilestone) => {
        timelineItems.push({
          id: `ms-${ms.id}`,
          type: 'milestone',
          date: ms.date,
          title: ms.title,
          description: ms.description,
          coverImage: ms.coverImage,
          rawItem: ms,
        });
      });

      plans.forEach((p: PlanItem) => {
        timelineItems.push({
          id: `plan-${p.id}`,
          type: 'plan',
          date: p.startAt || p.createdAt,
          title: p.title,
          description: p.description,
          location: p.location,
          rawItem: p,
        });
      });

      proposals
        .filter((pr: SpontaneousProposal) => pr.status === 'accepted')
        .forEach((pr: SpontaneousProposal) => {
          timelineItems.push({
            id: `prop-${pr.id}`,
            type: 'proposal',
            date: pr.proposedTime || pr.createdAt,
            title: pr.title,
            description: pr.description,
            location: pr.location,
            rawItem: pr,
          });
        });

      statuses.forEach((s: StatusUpdate) => {
        timelineItems.push({
          id: `status-${s.id}`,
          type: 'status',
          date: s.createdAt || s.updatedAt || new Date().toISOString(),
          title: s.mood ? `${s.mood} Status update` : 'Status update',
          description: s.statusMessage || s.customStatus || undefined,
          rawItem: s,
        });
      });

      // Sort chronologically (descending)
      return timelineItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
    enabled: !!coupleId,
    staleTime: 1000 * 60 * 2,
  });
}

// --- Mutations ---

export function useMemoryMutations(_coupleId?: string, partnerId?: string | null) {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: MEMORY_KEYS.all });
  };

  const createMemoryMutation = useMutation({
    mutationFn: (dto: CreateMemoryDTO) => memoryService.createMemory(dto, partnerId),
    onSuccess: () => invalidateAll(),
  });

  const editMemoryMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<MemoryItem> }) =>
      memoryService.editMemory(id, updates),
    onSuccess: () => invalidateAll(),
  });

  const deleteMemoryMutation = useMutation({
    mutationFn: (id: string) => memoryService.deleteMemory(id),
    onSuccess: () => invalidateAll(),
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: ({ id, isFavorite }: { id: string; isFavorite: boolean }) =>
      memoryService.favoriteMemory(id, !isFavorite),
    onSuccess: () => invalidateAll(),
  });

  const moveToAlbumMutation = useMutation({
    mutationFn: ({ memoryId, albumId }: { memoryId: string; albumId: string | null }) =>
      memoryService.moveToAlbum(memoryId, albumId),
    onSuccess: () => invalidateAll(),
  });

  const createAlbumMutation = useMutation({
    mutationFn: (dto: CreateAlbumDTO) => memoryService.createAlbum(dto, partnerId),
    onSuccess: () => invalidateAll(),
  });

  const deleteAlbumMutation = useMutation({
    mutationFn: (id: string) => memoryService.deleteAlbum(id),
    onSuccess: () => invalidateAll(),
  });

  const addCommentMutation = useMutation({
    mutationFn: ({
      memoryId,
      userId,
      content,
      parentCommentId,
    }: {
      memoryId: string;
      userId: string;
      content: string;
      parentCommentId?: string;
    }) => memoryService.addComment(memoryId, userId, content, parentCommentId, partnerId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: MEMORY_KEYS.comments(variables.memoryId) });
      invalidateAll();
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: ({ commentId }: { commentId: string; memoryId: string }) =>
      memoryService.deleteComment(commentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: MEMORY_KEYS.comments(variables.memoryId) });
      invalidateAll();
    },
  });

  const reactMutation = useMutation({
    mutationFn: ({
      memoryId,
      userId,
      emoji,
    }: {
      memoryId: string;
      userId: string;
      emoji: string;
    }) => memoryService.react(memoryId, userId, emoji, partnerId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: MEMORY_KEYS.reactions(variables.memoryId) });
      invalidateAll();
    },
  });

  const removeReactionMutation = useMutation({
    mutationFn: ({ memoryId, userId }: { memoryId: string; userId: string }) =>
      memoryService.removeReaction(memoryId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: MEMORY_KEYS.reactions(variables.memoryId) });
      invalidateAll();
    },
  });

  const createMilestoneMutation = useMutation({
    mutationFn: (dto: CreateMilestoneDTO) => memoryService.createMilestone(dto, partnerId),
    onSuccess: () => invalidateAll(),
  });

  const deleteMilestoneMutation = useMutation({
    mutationFn: (id: string) => memoryService.deleteMilestone(id),
    onSuccess: () => invalidateAll(),
  });

  return {
    createMemory: createMemoryMutation.mutateAsync,
    editMemory: editMemoryMutation.mutateAsync,
    deleteMemory: deleteMemoryMutation.mutateAsync,
    toggleFavorite: toggleFavoriteMutation.mutateAsync,
    moveToAlbum: moveToAlbumMutation.mutateAsync,
    createAlbum: createAlbumMutation.mutateAsync,
    deleteAlbum: deleteAlbumMutation.mutateAsync,
    addComment: addCommentMutation.mutateAsync,
    deleteComment: deleteCommentMutation.mutateAsync,
    react: reactMutation.mutateAsync,
    removeReaction: removeReactionMutation.mutateAsync,
    createMilestone: createMilestoneMutation.mutateAsync,
    deleteMilestone: deleteMilestoneMutation.mutateAsync,
    isCreating: createMemoryMutation.isPending,
  };
}
