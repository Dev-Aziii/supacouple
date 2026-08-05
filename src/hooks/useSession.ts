import { useAuthContext } from '@/context/useAuthContext';

export const useSession = () => {
  const { session, user, profile, isLoading, isInitialized } = useAuthContext();

  return {
    session,
    user,
    profile,
    isLoading,
    isInitialized,
    isAuthenticated: Boolean(session && user),
  };
};
