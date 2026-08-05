import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';

export const DashboardLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar variant="dashboard" />
      <main className="flex-1 container px-4 py-6 md:px-8 pb-24 md:pb-8 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
};
