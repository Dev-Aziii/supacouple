import React from 'react';
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
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const pixelDimensions = {
    sm: 28,
    md: 36,
    lg: 48,
  };

  return (
    <div className={cn('inline-flex items-center gap-2.5 select-none', className)} aria-label="Tezā Logo">
      <div className="relative flex items-center justify-center shrink-0">
        <picture>
          <source srcSet="/logo.webp" type="image/webp" />
          <img
            src="/logo.png"
            alt="Tezā logo"
            className={cn(iconSizes[size], 'object-contain transition-transform duration-300 hover:scale-105 filter drop-shadow-sm')}
            width={pixelDimensions[size]}
            height={pixelDimensions[size]}
            loading="eager"
            decoding="async"
          />
        </picture>
      </div>
      <div className="flex flex-col leading-none">
        <span className={cn('font-bold tracking-tight bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 bg-clip-text text-transparent font-sans', textSizes[size])}>
          Tezā
        </span>
        {showTagline && (
          <span className="text-xs text-muted-foreground font-medium tracking-wide mt-0.5">
            Couple Companion
          </span>
        )}
      </div>
    </div>
  );
};
