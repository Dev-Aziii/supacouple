import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { AppLogo } from '@/components/common/AppLogo';

export const MainLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar variant="main" />
      <main className="flex-1 pb-20 md:pb-8">
        <Outlet />
      </main>
      <footer className="hidden md:block border-t border-border/40 bg-card/30 py-6">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 px-4 text-xs text-muted-foreground">
          <AppLogo size="sm" />
          <p>© {new Date().getFullYear()} SupaCouple. Phase 1 Environment Prepared.</p>
        </div>
      </footer>
    </div>
  );
};
