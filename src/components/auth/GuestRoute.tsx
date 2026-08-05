import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSession } from '@/hooks/useSession';
import { FullScreenLoader } from '@/components/ui/FullScreenLoader';
import { ROUTES } from '@/constants/routes';

interface GuestRouteProps {
  children?: React.ReactNode;
}

export const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
  const { user, session, isLoading, isInitialized } = useSession();

  if (!isInitialized || isLoading) {
    return <FullScreenLoader message="Checking authentication status..." />;
  }

  if (session && user) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
