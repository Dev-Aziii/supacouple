import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { GuestRoute } from '@/components/auth/GuestRoute';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { PairPartnerPage } from '@/pages/PairPartnerPage';
import { PlansPage } from '@/pages/PlansPage';
import { ProposalPage } from '@/pages/ProposalPage';
import { GalleryPage } from '@/pages/GalleryPage';
import { TimelinePage } from '@/pages/TimelinePage';
import { ProfilePage } from '@/pages/ProfilePage';
import { SettingsPage } from '@/pages/SettingsPage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ROUTES } from '@/constants/routes';

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        path: ROUTES.HOME,
        element: <HomePage />,
      },
    ],
  },
  {
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            path: ROUTES.LOGIN,
            element: <LoginPage />,
          },
          {
            path: ROUTES.REGISTER,
            element: <RegisterPage />,
          },
          {
            path: ROUTES.FORGOT_PASSWORD,
            element: <ForgotPasswordPage />,
          },
          {
            path: ROUTES.RESET_PASSWORD,
            element: <ResetPasswordPage />,
          },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: ROUTES.DASHBOARD,
            element: <DashboardPage />,
          },
          {
            path: ROUTES.PAIR,
            element: <PairPartnerPage />,
          },
          {
            path: ROUTES.PLANS,
            element: <PlansPage />,
          },
          {
            path: ROUTES.CALENDAR,
            element: <PlansPage />,
          },
          {
            path: ROUTES.PROPOSAL,
            element: <ProposalPage />,
          },
          {
            path: ROUTES.MEMORIES,
            element: <GalleryPage />,
          },
          {
            path: ROUTES.GALLERY,
            element: <GalleryPage />,
          },
          {
            path: ROUTES.TIMELINE,
            element: <TimelinePage />,
          },
          {
            path: ROUTES.PROFILE,
            element: <ProfilePage />,
          },
          {
            path: ROUTES.SETTINGS,
            element: <SettingsPage />,
          },
          {
            path: ROUTES.NOTIFICATIONS,
            element: <NotificationsPage />,
          },
        ],
      },
    ],
  },
  {
    element: <MainLayout />,
    children: [
      {
        path: ROUTES.NOT_FOUND,
        element: <NotFoundPage />,
      },
    ],
  },
]);
