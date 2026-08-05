import React from 'react';
import { Heart, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';

interface AppLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  className,
  size = 'md',
  showTagline = false,
}) => {
  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div className={cn('inline-flex items-center gap-2.5 select-none', className)}>
      <div className="relative flex items-center justify-center p-2 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 shadow-md shadow-pink-500/20 text-white">
        <Heart className={cn(iconSizes[size], 'fill-white stroke-none animate-pulse-subtle')} />
        <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300 animate-spin-slow" />
      </div>
      <div className="flex flex-col">
        <span className={cn('font-bold tracking-tight bg-gradient-to-r from-pink-400 via-rose-400 to-purple-400 bg-clip-text text-transparent font-sans', textSizes[size])}>
          SupaCouple
        </span>
        {showTagline && (
          <span className="text-xs text-muted-foreground font-medium tracking-wide">
            Together, Every Day
          </span>
        )}
      </div>
    </div>
  );
};
