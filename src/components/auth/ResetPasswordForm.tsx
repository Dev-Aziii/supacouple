import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { resetPasswordSchema, ResetPasswordFormData } from '@/schemas/resetPasswordSchema';
import { supabase } from '@/services/supabase/client';
import { getFriendlyErrorMessage } from '@/services/errors';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ButtonSpinner } from '@/components/ui/ButtonSpinner';
import { ROUTES } from '@/constants/routes';

export const ResetPasswordForm: React.FC = () => {
  const navigate = useNavigate();
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsPending(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) throw error;

      toast.success('Your password has been updated successfully! Please sign in.');
      navigate(ROUTES.LOGIN);
    } catch (err) {
      toast.error(getFriendlyErrorMessage(err));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1">
        <label htmlFor="reset-password" className="text-xs font-semibold text-foreground/80">
          New Password
        </label>
        <Input
          id="reset-password"
          type="password"
          placeholder="At least 6 characters"
          autoComplete="new-password"
          disabled={isPending}
          aria-invalid={Boolean(errors.password)}
          {...register('password')}
        />
        {errors.password && (
          <p className="text-xs font-medium text-destructive mt-1">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="reset-confirm-password" className="text-xs font-semibold text-foreground/80">
          Confirm New Password
        </label>
        <Input
          id="reset-confirm-password"
          type="password"
          placeholder="Re-enter your new password"
          autoComplete="new-password"
          disabled={isPending}
          aria-invalid={Boolean(errors.confirmPassword)}
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && (
          <p className="text-xs font-medium text-destructive mt-1">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-rose-600 hover:bg-rose-700 text-white transition-colors"
      >
        {isPending ? (
          <span className="flex items-center gap-2">
            <ButtonSpinner />
            Updating Password...
          </span>
        ) : (
          'Update Password'
        )}
      </Button>

      <div className="pt-2 text-center text-xs text-muted-foreground">
        Remembered password?{' '}
        <Link
          to={ROUTES.LOGIN}
          className="font-semibold text-rose-500 hover:text-rose-600 hover:underline transition-colors"
        >
          Back to Sign In
        </Link>
      </div>
    </form>
  );
};
