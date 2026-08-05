import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Heart, Calendar, Send, Camera, Clock, Bell, LogIn, UserPlus } from 'lucide-react';
import { AppLogo } from '@/components/common/AppLogo';
import { UnreadBadge } from '@/components/notifications/UnreadBadge';
import { UserAvatarDropdown } from '@/components/layout/UserAvatarDropdown';
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
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <NavLink to={ROUTES.HOME} className="flex items-center gap-2">
          <AppLogo size="sm" />
        </NavLink>

        {variant === 'auth' ? (
          <nav className="flex items-center gap-3">
            <NavLink
              to={ROUTES.LOGIN}
              className={({ isActive }) =>
                cn(
                  'px-3.5 py-1.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5',
                  isActive ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'
                )
              }
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </NavLink>
            <NavLink
              to={ROUTES.REGISTER}
              className="px-4 py-1.5 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register</span>
            </NavLink>
          </nav>
        ) : (
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        'px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 relative',
                        isActive
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                      )
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <NavLink
                to={ROUTES.NOTIFICATIONS}
                className={({ isActive }) =>
                  cn(
                    'p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors relative',
                    isActive && 'bg-secondary text-foreground'
                  )
                }
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {Boolean(unreadCount && unreadCount > 0) && (
                  <UnreadBadge count={unreadCount} dotOnly className="absolute top-1 right-1" />
                )}
              </NavLink>

              <UserAvatarDropdown />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Navigation Bar */}
      {variant !== 'auth' && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-lg md:hidden">
          <div className="flex items-center justify-around py-2 px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex flex-col items-center gap-1 px-2 py-1 rounded-xl text-[11px] font-medium transition-colors',
                      isActive ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'
                    )
                  }
                >
                  <Icon className="w-4 h-4" />
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

