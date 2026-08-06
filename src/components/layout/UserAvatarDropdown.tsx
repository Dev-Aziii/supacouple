import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { User, Settings, Moon, Sun, Shield, LogOut, ChevronDown, Heart, Bell, X } from 'lucide-react';
import { useSession } from '@/hooks/useSession';
import { useCouple } from '@/hooks/useCouple';
import { useSignOut } from '@/hooks/useSignOut';
import { useTheme } from '@/hooks/useTheme';
import { ROUTES } from '@/constants/routes';

interface UserAvatarDropdownProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const UserAvatarDropdown: React.FC<UserAvatarDropdownProps> = ({
  isMobileOpen = false,
  onMobileClose,
}) => {
  const navigate = useNavigate();
  const { profile, user } = useSession();
  const { relationshipStatus, partner } = useCouple();
  const { mutate: signOut } = useSignOut();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userName = profile?.displayName || user?.user_metadata?.display_name || 'User';
  const avatarUrl = profile?.avatarUrl;
  const isPartnered = relationshipStatus === 'partnered';

  const isDrawerActive = isOpen || isMobileOpen;

  const handleClose = () => {
    setIsOpen(false);
    onMobileClose?.();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleNavigate = (path: string) => {
    handleClose();
    navigate(path);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-secondary/60 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden bg-secondary flex items-center justify-center border border-border">
          {avatarUrl ? (
            <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
          ) : (
            <User className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Desktop Dropdown (Hidden on Mobile < md) */}
      {isOpen && (
        <div className="hidden md:block absolute right-0 mt-2 w-56 rounded-2xl border border-border bg-popover/95 backdrop-blur-lg p-2 text-popover-foreground shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-border/60 mb-1">
            <p className="text-sm font-semibold text-foreground truncate">{userName}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>

          <div className="space-y-0.5">
            <button
              onClick={() => handleNavigate(ROUTES.PROFILE)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-foreground rounded-xl hover:bg-secondary/70 transition-colors text-left"
            >
              <User className="w-4 h-4 text-muted-foreground" />
              <span>Profile</span>
            </button>

            <button
              onClick={() => handleNavigate(ROUTES.SETTINGS)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-foreground rounded-xl hover:bg-secondary/70 transition-colors text-left"
            >
              <Settings className="w-4 h-4 text-muted-foreground" />
              <span>Settings</span>
            </button>

            <button
              onClick={() => handleNavigate(ROUTES.NOTIFICATIONS)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-foreground rounded-xl hover:bg-secondary/70 transition-colors text-left"
            >
              <Bell className="w-4 h-4 text-muted-foreground" />
              <span>Notifications</span>
            </button>

            <button
              onClick={() => handleNavigate(ROUTES.PAIR)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-foreground rounded-xl hover:bg-secondary/70 transition-colors text-left"
            >
              <Heart className="w-4 h-4 text-pink-500" />
              <span>{isPartnered ? 'Manage Relationship' : 'Pair Partner'}</span>
            </button>

            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-foreground rounded-xl hover:bg-secondary/70 transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                {theme === 'dark' ? (
                  <Moon className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Sun className="w-4 h-4 text-muted-foreground" />
                )}
                <span>Theme</span>
              </div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground px-2 py-0.5 rounded-md bg-secondary">
                {theme}
              </span>
            </button>

            <button
              onClick={() => handleNavigate(ROUTES.SETTINGS)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-foreground rounded-xl hover:bg-secondary/70 transition-colors text-left"
            >
              <Shield className="w-4 h-4 text-muted-foreground" />
              <span>Privacy</span>
            </button>
          </div>

          <div className="pt-1 mt-1 border-t border-border/60">
            <button
              onClick={() => {
                handleClose();
                signOut();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-destructive rounded-xl hover:bg-destructive/10 transition-colors text-left"
            >
              <LogOut className="w-4 h-4 text-destructive" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Slide-Over Drawer Panel via Portal to document.body (Visible on Mobile < md when active) */}
      {isDrawerActive &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-[9999] md:hidden">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
              onClick={handleClose}
            />

            {/* Right Slide-Over Panel */}
            <div className="fixed inset-y-0 right-0 w-[85vw] max-w-80 bg-card text-card-foreground border-l border-border/80 shadow-2xl p-6 pt-8 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
              <div className="space-y-6">
                {/* Header: User Info & Close */}
                <div className="flex items-center justify-between pb-4 border-b border-border/60">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full overflow-hidden bg-secondary border border-primary/30 flex items-center justify-center shrink-0">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="text-sm font-bold text-foreground truncate">{userName}</h3>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/10 text-pink-400 border border-pink-500/20">
                        {isPartnered ? `Partnered with ${partner?.displayName || 'Partner'} 💕` : 'Single'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleClose}
                    className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Navigation Menu List */}
                <div className="space-y-1">
                  <button
                    onClick={() => handleNavigate(ROUTES.PROFILE)}
                    className="w-full flex items-center gap-3 px-3.5 py-3 text-xs font-semibold text-foreground rounded-2xl hover:bg-secondary transition-colors text-left"
                  >
                    <User className="w-4 h-4 text-primary" />
                    <span>Profile</span>
                  </button>

                  <button
                    onClick={() => handleNavigate(ROUTES.SETTINGS)}
                    className="w-full flex items-center gap-3 px-3.5 py-3 text-xs font-semibold text-foreground rounded-2xl hover:bg-secondary transition-colors text-left"
                  >
                    <Settings className="w-4 h-4 text-primary" />
                    <span>Settings</span>
                  </button>

                  <button
                    onClick={() => handleNavigate(ROUTES.NOTIFICATIONS)}
                    className="w-full flex items-center gap-3 px-3.5 py-3 text-xs font-semibold text-foreground rounded-2xl hover:bg-secondary transition-colors text-left"
                  >
                    <Bell className="w-4 h-4 text-primary" />
                    <span>Notifications</span>
                  </button>

                  <button
                    onClick={() => handleNavigate(ROUTES.PAIR)}
                    className="w-full flex items-center gap-3 px-3.5 py-3 text-xs font-semibold text-foreground rounded-2xl hover:bg-secondary transition-colors text-left"
                  >
                    <Heart className="w-4 h-4 text-pink-500" />
                    <span>{isPartnered ? 'Manage Relationship' : 'Pair Partner'}</span>
                  </button>

                  <button
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-between px-3.5 py-3 text-xs font-semibold text-foreground rounded-2xl hover:bg-secondary transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      {theme === 'dark' ? (
                        <Moon className="w-4 h-4 text-primary" />
                      ) : (
                        <Sun className="w-4 h-4 text-primary" />
                      )}
                      <span>Theme</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground px-2 py-0.5 rounded-md bg-secondary">
                      {theme}
                    </span>
                  </button>

                  <button
                    onClick={() => handleNavigate(ROUTES.SETTINGS)}
                    className="w-full flex items-center gap-3 px-3.5 py-3 text-xs font-semibold text-foreground rounded-2xl hover:bg-secondary transition-colors text-left"
                  >
                    <Shield className="w-4 h-4 text-primary" />
                    <span>Privacy</span>
                  </button>
                </div>
              </div>

              {/* Logout Footer Button */}
              <div className="pt-4 border-t border-border/60">
                <button
                  onClick={() => {
                    handleClose();
                    signOut();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold text-destructive bg-destructive/10 rounded-2xl hover:bg-destructive/20 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-destructive" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
