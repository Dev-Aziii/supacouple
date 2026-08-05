import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSession } from '@/hooks/useSession';
import { FullScreenLoader } from '@/components/ui/FullScreenLoader';
import { ROUTES } from '@/constants/routes';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, session, isLoading, isInitialized } = useSession();

  if (!isInitialized || isLoading) {
    return <FullScreenLoader message="Checking authentication status..." />;
  }

  if (!session || !user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
