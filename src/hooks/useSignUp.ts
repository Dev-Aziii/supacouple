import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthContext } from '@/context/useAuthContext';
import { getFriendlyErrorMessage } from '@/services/errors';

export type SignUpParams = {
  email: string;
  password: string;
  displayName?: string;
};

export const useSignUp = () => {
  const { signUp } = useAuthContext();

  return useMutation({
    mutationFn: async (params: SignUpParams) => {
      const response = await signUp({
        email: params.email,
        password: params.password,
        displayName: params.displayName,
      });
      if (response.error) {
        throw response.error;
      }
      return response.data;
    },
    onSuccess: (data) => {
      if (data?.session) {
        toast.success('Account created successfully! Welcome to Tezā.');
      } else {
        toast.success('Account created! Please check your email to confirm your address before logging in.', {
          duration: 6000,
        });
      }
    },
    onError: (error) => {
      toast.error(getFriendlyErrorMessage(error));
    },
  });
};
