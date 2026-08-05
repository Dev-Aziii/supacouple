import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Heart, Calendar, Send, Camera, Clock, User, Settings, Bell, LogIn, UserPlus } from 'lucide-react';
import { AppLogo } from '@/components/common/AppLogo';
import { UnreadBadge } from '@/components/notifications/UnreadBadge';
import { useNotifications } from '@/hooks/useNotifications';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/utils/cn';

interface NavbarProps {
  variant?: 'main' | 'dashboard' | 'auth';
}

export const Navbar: React.FC<NavbarProps> = ({ variant = 'main' }) => {
  const { unreadCount } = useNotifications();

  const navItems = [
    { to: ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { to: ROUTES.GALLERY, label: 'Memories', icon: Camera },
    { to: ROUTES.TIMELINE, label: 'Timeline', icon: Clock },
    { to: ROUTES.PAIR, label: 'Pairing', icon: Heart },
    { to: ROUTES.PLANS, label: 'Plans', icon: Calendar },
    { to: ROUTES.PROPOSAL, label: 'Proposals', icon: Send },
    { to: ROUTES.NOTIFICATIONS, label: 'Notifications', icon: Bell, badge: unreadCount },
    { to: ROUTES.PROFILE, label: 'Profile', icon: User },
    { to: ROUTES.SETTINGS, label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        <NavLink to={ROUTES.HOME} className="flex items-center gap-2">
          <AppLogo size="sm" />
        </NavLink>

        {variant === 'auth' ? (
          <nav className="flex items-center gap-3">
            <NavLink
              to={ROUTES.LOGIN}
              className={({ isActive }) =>
                cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5',
                  isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
                )
              }
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </NavLink>
            <NavLink
              to={ROUTES.REGISTER}
              className="px-4 py-1.5 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register</span>
            </NavLink>
          </nav>
        ) : (
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 relative',
                      isActive
                        ? 'bg-pink-500/10 text-pink-400 font-semibold border border-pink-500/20'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    )
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {Boolean(item.badge && item.badge > 0) && (
                    <UnreadBadge count={item.badge!} className="ml-1" />
                  )}
                </NavLink>
              );
            })}
          </nav>
        )}
      </div>

      {/* Mobile Bottom Bar for Dashboard / Main views */}
      {variant !== 'auth' && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-background/95 backdrop-blur-lg md:hidden">
          <div className="flex items-center justify-around py-2.5 px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-medium transition-colors relative',
                      isActive ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
                    )
                  }
                >
                  <div className="relative">
                    <Icon className="w-5 h-5" />
                    {Boolean(item.badge && item.badge > 0) && (
                      <UnreadBadge count={item.badge!} dotOnly className="absolute -top-1 -right-1" />
                    )}
                  </div>
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
