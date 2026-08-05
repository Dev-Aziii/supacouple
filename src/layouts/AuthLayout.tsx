import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { AppLogo } from '@/components/common/AppLogo';

export const AuthLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar variant="auth" />
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <AppLogo size="lg" showTagline />
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  );
};
