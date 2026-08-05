import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, Moon, Sun, Shield, UserCog, LogOut, ChevronDown } from 'lucide-react';
import { useSession } from '@/hooks/useSession';
import { useSignOut } from '@/hooks/useSignOut';
import { useTheme } from '@/hooks/useTheme';
import { ROUTES } from '@/constants/routes';

export const UserAvatarDropdown: React.FC = () => {
  const navigate = useNavigate();
  const { profile, user } = useSession();
  const { mutate: signOut } = useSignOut();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userName = profile?.displayName || user?.user_metadata?.display_name || 'User';
  const avatarUrl = profile?.avatarUrl;

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
    setIsOpen(false);
    navigate(path);
  };

  return (
    <div className="relative" ref={dropdownRef}>
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
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-border bg-popover p-2 text-popover-foreground shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
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

            <button
              onClick={() => handleNavigate(ROUTES.SETTINGS)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-foreground rounded-xl hover:bg-secondary/70 transition-colors text-left"
            >
              <UserCog className="w-4 h-4 text-muted-foreground" />
              <span>Account</span>
            </button>
          </div>

          <div className="pt-1 mt-1 border-t border-border/60">
            <button
              onClick={() => {
                setIsOpen(false);
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
    </div>
  );
};
