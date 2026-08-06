import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthContext } from '@/context/useAuthContext';
import { getFriendlyErrorMessage } from '@/services/errors';

export const useGoogleSignIn = () => {
  const { signInWithGoogle } = useAuthContext();

  return useMutation({
    mutationFn: async (redirectTo?: string) => {
      const response = await signInWithGoogle(redirectTo);
      if (response.error) {
        throw response.error;
      }
      return response.data;
    },
    onSuccess: () => {
      toast.info('Redirecting to Google Sign-In...');
    },
    onError: (error) => {
      toast.error(getFriendlyErrorMessage(error));
    },
  });
};
