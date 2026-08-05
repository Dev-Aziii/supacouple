import { create } from 'zustand';
import { supabase } from '../services/supabase/client';
import { coupleService } from '../services/couple/coupleService';
import type { Couple } from '../services/repositories/couplesRepository';
import type { Invitation } from '../services/repositories/invitationsRepository';
import type { UserProfile } from '../types/user';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type RelationshipStatusType =
  | 'single'
  | 'invited'
  | 'pending'
  | 'partnered'
  | 'paused'
  | 'ended';

interface RelationshipState {
  currentCouple: Couple | null;
  partner: UserProfile | null;
  relationshipStatus: RelationshipStatusType;
  pendingSent: Invitation[];
  pendingReceived: Invitation[];
  isLoading: boolean;
  isInitialized: boolean;
  channel: RealtimeChannel | null;

  // Actions
  fetchRelationship: () => Promise<void>;
  subscribeToRealtime: (userId: string) => void;
  unsubscribeRealtime: () => void;
  reset: () => void;
}

export const useRelationshipStore = create<RelationshipState>((set, get) => ({
  currentCouple: null,
  partner: null,
  relationshipStatus: 'single',
  pendingSent: [],
  pendingReceived: [],
  isLoading: true,
  isInitialized: false,
  channel: null,

  fetchRelationship: async () => {
    set({ isLoading: true });
    try {
      const { couple, partner } = await coupleService.getCurrentCouple();
      const { sent, received } = await coupleService.getPendingInvites();

      let status: RelationshipStatusType = 'single';

      if (partner || (couple && couple.status === 'active')) {
        status = 'partnered';
      } else if (couple && couple.status === 'paused') {
        status = 'paused';
      } else if (couple && couple.status === 'ended') {
        status = 'ended';
      } else if (received.length > 0) {
        status = 'invited';
      } else if (sent.length > 0) {
        status = 'pending';
      }

      set({
        currentCouple: couple,
        partner,
        relationshipStatus: status,
        pendingSent: sent,
        pendingReceived: received,
        isLoading: false,
        isInitialized: true,
      });
    } catch (err) {
      console.error('[relationshipStore] fetchRelationship error:', err);
      set({ isLoading: false, isInitialized: true });
    }
  },

  subscribeToRealtime: (userId: string) => {
    const existingChannel = get().channel;
    if (existingChannel) return;

    const channel = supabase
      .channel(`relationship_realtime_${userId}`)
      // Listen to invitation updates
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'invitations' },
        () => {
          get().fetchRelationship();
        }
      )
      // Listen to couple updates
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'couples' },
        () => {
          get().fetchRelationship();
        }
      )
      // Listen to profile updates (e.g. partner_id changed)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          get().fetchRelationship();
        }
      )
      .subscribe();

    set({ channel });
  },

  unsubscribeRealtime: () => {
    const channel = get().channel;
    if (channel) {
      supabase.removeChannel(channel);
      set({ channel: null });
    }
  },

  reset: () => {
    get().unsubscribeRealtime();
    set({
      currentCouple: null,
      partner: null,
      relationshipStatus: 'single',
      pendingSent: [],
      pendingReceived: [],
      isLoading: false,
      isInitialized: false,
      channel: null,
    });
  },
}));
