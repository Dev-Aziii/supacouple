import React from 'react';
import { Heart } from 'lucide-react';

interface FavoriteBadgeProps {
  isFavorite: boolean;
  onToggle?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const FavoriteBadge: React.FC<FavoriteBadgeProps> = ({
  isFavorite,
  onToggle,
  size = 'md',
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle?.();
      }}
      disabled={!onToggle}
      className={`p-2 rounded-full backdrop-blur-md transition-all duration-300 transform active:scale-95 ${
        isFavorite
          ? 'bg-rose-500/90 text-white shadow-lg shadow-rose-500/30 hover:bg-rose-600'
          : 'bg-black/30 text-white/80 hover:bg-black/50 hover:text-rose-400'
      } ${className}`}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        className={`${iconSizes[size]} ${isFavorite ? 'fill-current' : ''}`}
      />
    </button>
  );
};
