import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { loginSchema, LoginFormData } from '@/schemas/loginSchema';
import { useSignIn } from '@/hooks/useSignIn';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ButtonSpinner } from '@/components/ui/ButtonSpinner';
import { SocialAuthPlaceholder } from './SocialAuthPlaceholder';
import { ROUTES } from '@/constants/routes';

export const LoginForm: React.FC = () => {
  const { mutate: signIn, isPending } = useSignIn();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormData) => {
    signIn({
      email: data.email,
      password: data.password,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1">
        <label htmlFor="login-email" className="text-xs font-semibold text-foreground/80">
          Email Address
        </label>
        <Input
          id="login-email"
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
        <div className="flex items-center justify-between">
          <label htmlFor="login-password" className="text-xs font-semibold text-foreground/80">
            Password
          </label>
          <Link
            to={ROUTES.FORGOT_PASSWORD}
            className="text-xs text-rose-500 hover:text-rose-600 hover:underline transition-colors font-medium"
          >
            Forgot password?
          </Link>
        </div>
        <Input
          id="login-password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          disabled={isPending}
          aria-invalid={Boolean(errors.password)}
          {...register('password')}
        />
        {errors.password && (
          <p className="text-xs font-medium text-destructive mt-1">{errors.password.message}</p>
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
            Signing in...
          </span>
        ) : (
          'Sign In'
        )}
      </Button>

      <SocialAuthPlaceholder />

      <div className="pt-2 text-center text-xs text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link
          to={ROUTES.REGISTER}
          className="font-semibold text-rose-500 hover:text-rose-600 hover:underline transition-colors"
        >
          Create account
        </Link>
      </div>
    </form>
  );
};
