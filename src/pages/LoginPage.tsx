import React from 'react';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { LoginForm } from '@/components/auth/LoginForm';

export const LoginPage: React.FC = () => {
  return (
    <div className="flex w-full items-center justify-center min-h-[calc(100vh-8rem)] py-8 px-4 sm:px-6">
      <AuthCard>
        <AuthHeader
          title="Welcome Back"
          subtitle="Sign in to reconnect with your partner"
        />
        <LoginForm />
      </AuthCard>
    </div>
  );
};

export default LoginPage;
