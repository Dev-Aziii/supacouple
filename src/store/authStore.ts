import { create } from 'zustand';
import type { User, Session } from '@supabase/supabase-js';
import type { UserProfile } from '@/types/user';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  setAuth: (payload: {
    user: User | null;
    session: Session | null;
    profile?: UserProfile | null;
  }) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (isLoading: boolean) => void;
  setInitialized: (isInitialized: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  isInitialized: false,

  setAuth: ({ user, session, profile = null }) =>
    set((state) => ({
      user,
      session,
      profile: profile !== undefined ? profile : state.profile,
    })),

  setProfile: (profile) => set({ profile }),

  setLoading: (isLoading) => set({ isLoading }),

  setInitialized: (isInitialized) => set({ isInitialized, isLoading: false }),

  logout: () =>
    set({
      user: null,
      session: null,
      profile: null,
      isLoading: false,
      isInitialized: true,
    }),
}));
