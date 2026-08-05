import { useAuthContext } from '@/context/useAuthContext';

export const useAuth = () => {
  return useAuthContext();
};
