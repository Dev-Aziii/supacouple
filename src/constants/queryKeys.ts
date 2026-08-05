export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    session: () => [...queryKeys.auth.all, 'session'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
  },
  profile: {
    all: ['profile'] as const,
    detail: (userId: string) => [...queryKeys.profile.all, userId] as const,
    couple: (coupleId: string) => [...queryKeys.profile.all, 'couple', coupleId] as const,
  },
  status: {
    all: ['status'] as const,
    user: (userId: string) => [...queryKeys.status.all, userId] as const,
    couple: (coupleId: string) => [...queryKeys.status.all, 'couple', coupleId] as const,
  },
  plans: {
    all: ['plans'] as const,
    lists: () => [...queryKeys.plans.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.plans.all, 'detail', id] as const,
    month: (coupleId: string, year: number, month: number) => [...queryKeys.plans.all, 'month', coupleId, year, month] as const,
    upcoming: (coupleId: string) => [...queryKeys.plans.all, 'upcoming', coupleId] as const,
    today: (coupleId: string) => [...queryKeys.plans.all, 'today', coupleId] as const,
  },
  proposals: {
    all: ['proposals'] as const,
    lists: () => [...queryKeys.proposals.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.proposals.all, 'detail', id] as const,
  },
  memories: {
    all: ['memories'] as const,
    lists: () => [...queryKeys.memories.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.memories.all, 'detail', id] as const,
  },
  settings: {
    all: ['settings'] as const,
    user: (userId: string) => [...queryKeys.settings.all, userId] as const,
  },
} as const;
