import { QueryClient } from '@tanstack/react-query';

/**
 * Configure global TanStack Query Client options.
 *
 * Choice Rationales:
 * - staleTime: 1000 * 60 * 5 (5 minutes) -> Reduces redundant network requests for shared status & plans while staying fresh.
 * - gcTime: 1000 * 60 * 30 (30 minutes) -> Keeps inactive query results in memory to allow fast offline/back navigation.
 * - retry: 2 -> Retries failed network requests twice with exponential backoff before throwing errors.
 * - refetchOnWindowFocus: false -> Prevents distracting UI re-renders when switching tabs/apps on mobile devices.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime in React Query v4)
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
    },
    mutations: {
      retry: 1,
    },
  },
});
