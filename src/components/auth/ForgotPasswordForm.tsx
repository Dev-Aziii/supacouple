import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { forgotPasswordSchema, ForgotPasswordFormData } from '@/schemas/forgotPasswordSchema';
import { useResetPassword } from '@/hooks/useResetPassword';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ButtonSpinner } from '@/components/ui/ButtonSpinner';
import { ROUTES } from '@/constants/routes';

export const ForgotPasswordForm: React.FC = () => {
  const { mutate: resetPassword, isPending, isSuccess } = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    resetPassword(data.email);
  };

  return (
    <div className="space-y-4">
      {isSuccess ? (
        <div className="space-y-4 text-center py-2">
          <div className="p-3 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-lg text-xs leading-relaxed font-medium">
            Password reset instructions have been sent to your email address if an account exists.
          </div>
          <Button asChild variant="outline" className="w-full">
            <Link to={ROUTES.LOGIN}>Return to Sign In</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1">
            <label htmlFor="forgot-email" className="text-xs font-semibold text-foreground/80">
              Email Address
            </label>
            <Input
              id="forgot-email"
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              disabled={isPending}
              aria-invalid={Boolean(errors.email)}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-xs font-medium text-destructive mt-1">{errors.email.message}</p>
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
                Sending Reset Link...
              </span>
            ) : (
              'Send Reset Link'
            )}
          </Button>

          <div className="pt-2 text-center text-xs text-muted-foreground">
            Remember your password?{' '}
            <Link
              to={ROUTES.LOGIN}
              className="font-semibold text-rose-500 hover:text-rose-600 hover:underline transition-colors"
            >
              Sign In
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};
