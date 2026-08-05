/**
 * Application Routes Map
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  PAIR: '/pair',
  PLANS: '/plans',
  CALENDAR: '/calendar',
  PROPOSAL: '/proposal',
  MEMORIES: '/memories',
  GALLERY: '/gallery',
  TIMELINE: '/timeline',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  NOTIFICATIONS: '/notifications',
  NOT_FOUND: '*',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
