import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthContext } from '@/context/useAuthContext';
import { getFriendlyErrorMessage } from '@/services/errors';

export const useResetPassword = () => {
  const { resetPassword } = useAuthContext();

  return useMutation({
    mutationFn: async (email: string) => {
      const response = await resetPassword(email);
      if (response.error) {
        throw response.error;
      }
      return response.data;
    },
    onSuccess: () => {
      toast.success('Password reset link sent! Check your email inbox.', {
        duration: 6000,
      });
    },
    onError: (error) => {
      toast.error(getFriendlyErrorMessage(error));
    },
  });
};
