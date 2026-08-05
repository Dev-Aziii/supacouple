import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { registerSchema, RegisterFormData } from '@/schemas/registerSchema';
import { useSignUp } from '@/hooks/useSignUp';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ButtonSpinner } from '@/components/ui/ButtonSpinner';
import { SocialAuthPlaceholder } from './SocialAuthPlaceholder';
import { ROUTES } from '@/constants/routes';

export const RegisterForm: React.FC = () => {
  const { mutate: signUp, isPending } = useSignUp();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    signUp({
      email: data.email,
      password: data.password,
      displayName: data.displayName,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1">
        <label htmlFor="register-name" className="text-xs font-semibold text-foreground/80">
          Display Name
        </label>
        <Input
          id="register-name"
          type="text"
          placeholder="Your full name"
          autoComplete="name"
          disabled={isPending}
          aria-invalid={Boolean(errors.displayName)}
          {...register('displayName')}
        />
        {errors.displayName && (
          <p className="text-xs font-medium text-destructive mt-1">{errors.displayName.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="register-email" className="text-xs font-semibold text-foreground/80">
          Email Address
        </label>
        <Input
          id="register-email"
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

      <div className="space-y-1">
        <label htmlFor="register-password" className="text-xs font-semibold text-foreground/80">
          Password
        </label>
        <Input
          id="register-password"
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
        <label htmlFor="register-confirm-password" className="text-xs font-semibold text-foreground/80">
          Confirm Password
        </label>
        <Input
          id="register-confirm-password"
          type="password"
          placeholder="Re-enter your password"
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
            Creating Account...
          </span>
        ) : (
          'Create Account'
        )}
      </Button>

      <SocialAuthPlaceholder />

      <div className="pt-2 text-center text-xs text-muted-foreground">
        Already have an account?{' '}
        <Link
          to={ROUTES.LOGIN}
          className="font-semibold text-rose-500 hover:text-rose-600 hover:underline transition-colors"
        >
          Sign In
        </Link>
      </div>
    </form>
  );
};
