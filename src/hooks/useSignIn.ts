import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthContext } from '@/context/useAuthContext';
import { getFriendlyErrorMessage } from '@/services/errors';
import type { SignInWithPasswordCredentials } from '@supabase/supabase-js';

export const useSignIn = () => {
  const { signIn } = useAuthContext();

  return useMutation({
    mutationFn: async (credentials: SignInWithPasswordCredentials) => {
      const response = await signIn(credentials);
      if (response.error) {
        throw response.error;
      }
      return response.data;
    },
    onSuccess: () => {
      toast.success('Login successful! Welcome back.');
    },
    onError: (error) => {
      toast.error(getFriendlyErrorMessage(error));
    },
  });
};
