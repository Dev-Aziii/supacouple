import { createContext } from 'react';
import type { User, Session, SignInWithPasswordCredentials, SignUpWithPasswordCredentials } from '@supabase/supabase-js';
import type { AuthResponse } from '@/services/auth/authService';
import type { UserProfile } from '@/types/user';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isInitialized: boolean;
  signIn: (credentials: SignInWithPasswordCredentials) => Promise<AuthResponse<{ user: User | null; session: Session | null }>>;
  signUp: (credentials: SignUpWithPasswordCredentials & { displayName?: string }) => Promise<AuthResponse<{ user: User | null; session: Session | null }>>;
  signInWithGoogle: (redirectTo?: string) => Promise<AuthResponse<{ provider: string; url: string | null }>>;
  signOut: () => Promise<AuthResponse<null>>;
  resetPassword: (email: string, redirectTo?: string) => Promise<AuthResponse<null>>;
  refreshProfile: () => Promise<UserProfile | null>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
