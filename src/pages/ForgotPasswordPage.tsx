import React from 'react';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

export const ForgotPasswordPage: React.FC = () => {
  return (
    <div className="flex w-full items-center justify-center min-h-[calc(100vh-8rem)] py-8 px-4 sm:px-6">
      <AuthCard>
        <AuthHeader
          title="Forgot Password"
          subtitle="Enter your email to receive a password reset link"
        />
        <ForgotPasswordForm />
      </AuthCard>
    </div>
  );
};

export default ForgotPasswordPage;
