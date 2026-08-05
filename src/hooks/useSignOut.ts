import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthContext } from '@/context/useAuthContext';
import { getFriendlyErrorMessage } from '@/services/errors';

export const useSignOut = () => {
  const { signOut } = useAuthContext();

  return useMutation({
    mutationFn: async () => {
      const response = await signOut();
      if (response.error) {
        throw response.error;
      }
      return response.data;
    },
    onSuccess: () => {
      toast.success('Logged out successfully.');
    },
    onError: (error) => {
      toast.error(getFriendlyErrorMessage(error));
    },
  });
};
