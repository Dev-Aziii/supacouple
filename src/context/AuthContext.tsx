import React, { useEffect, useCallback } from 'react';
import type { User, SignUpWithPasswordCredentials, SignInWithPasswordCredentials } from '@supabase/supabase-js';
import { supabase } from '@/services/supabase/client';
import { authService } from '@/services/auth/authService';
import { usersRepository } from '@/services/repositories/usersRepository';
import { useAuthStore } from '@/store/authStore';
import type { UserProfile } from '@/types/user';
import { AuthContext } from './AuthContextCore';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, session, profile, isLoading, isInitialized, setAuth, setProfile, setLoading, setInitialized, logout } = useAuthStore();

  const syncUserProfile = useCallback(
    async (currentUser: User): Promise<UserProfile | null> => {
      try {
        let existingProfile = await usersRepository.getById(currentUser.id);
        if (!existingProfile) {
          const defaultName =
            currentUser.user_metadata?.display_name ||
            currentUser.user_metadata?.full_name ||
            currentUser.email?.split('@')[0] ||
            'User';
          existingProfile = await usersRepository.createProfile({
            id: currentUser.id,
            email: currentUser.email || '',
            displayName: defaultName,
            avatarUrl: currentUser.user_metadata?.avatar_url || null,
          });
        }
        setProfile(existingProfile);
        return existingProfile;
      } catch (err) {
        console.error('[AuthProvider] Sync profile error:', err);
        return null;
      }
    },
    [setProfile]
  );

  const refreshProfile = useCallback(async (): Promise<UserProfile | null> => {
    if (!user) return null;
    return syncUserProfile(user);
  }, [user, syncUserProfile]);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      setLoading(true);
      try {
        const { data: currentSession } = await authService.getSession();
        if (currentSession?.user) {
          const currentUser = currentSession.user;
          if (isMounted) {
            setAuth({ user: currentUser, session: currentSession });
            await syncUserProfile(currentUser);
          }
        } else {
          if (isMounted) logout();
        }
      } catch (err) {
        console.error('[AuthProvider] Auth init error:', err);
        if (isMounted) logout();
      } finally {
        if (isMounted) setInitialized(true);
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!isMounted) return;

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (newSession?.user) {
          setAuth({ user: newSession.user, session: newSession });
          await syncUserProfile(newSession.user);
        }
      } else if (event === 'SIGNED_OUT') {
        logout();
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [setAuth, setInitialized, setLoading, logout, syncUserProfile]);

  const signIn = async (credentials: SignInWithPasswordCredentials) => {
    setLoading(true);
    const result = await authService.signIn(credentials);
    if (result.data?.user && result.data?.session) {
      setAuth({ user: result.data.user, session: result.data.session });
      await syncUserProfile(result.data.user);
    }
    setLoading(false);
    return result;
  };

  const signUp = async (credentials: SignUpWithPasswordCredentials & { displayName?: string }) => {
    setLoading(true);
    const { displayName, ...authCreds } = credentials;
    const signUpCreds: SignUpWithPasswordCredentials = {
      ...authCreds,
      options: {
        ...authCreds.options,
        data: {
          ...authCreds.options?.data,
          display_name: displayName,
        },
      },
    };

    const result = await authService.signUp(signUpCreds);
    if (result.data?.user && result.data?.session) {
      setAuth({ user: result.data.user, session: result.data.session });
      await syncUserProfile(result.data.user);
    }
    setLoading(false);
    return result;
  };

  const signOut = async () => {
    setLoading(true);
    const result = await authService.signOut();
    logout();
    return result;
  };

  const resetPassword = async (email: string, redirectTo?: string) => {
    const defaultRedirect = `${window.location.origin}/reset-password`;
    return authService.resetPassword(email, redirectTo || defaultRedirect);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        isInitialized,
        signIn,
        signUp,
        signOut,
        resetPassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
