import React from 'react';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';

export const ResetPasswordPage: React.FC = () => {
  return (
    <div className="flex w-full items-center justify-center min-h-[calc(100vh-8rem)] py-8 px-4 sm:px-6">
      <AuthCard>
        <AuthHeader
          title="Reset Password"
          subtitle="Choose a new password for your account"
        />
        <ResetPasswordForm />
      </AuthCard>
    </div>
  );
};

export default ResetPasswordPage;
