import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase/client';
import { MEMORY_KEYS } from './useMemories';

export function useRealtimeMemories(coupleId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!coupleId) return;

    const channelName = `realtime-memories-${coupleId}-${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'memories',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: MEMORY_KEYS.all });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'memory_albums',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: MEMORY_KEYS.all });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'memory_comments',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: MEMORY_KEYS.all });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'memory_reactions',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: MEMORY_KEYS.all });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'relationship_milestones',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: MEMORY_KEYS.all });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [coupleId, queryClient]);
}
