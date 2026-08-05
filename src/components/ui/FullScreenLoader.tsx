import React from 'react';
import { Heart } from 'lucide-react';

interface FullScreenLoaderProps {
  message?: string;
}

export const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm transition-all duration-300">
      <div className="relative flex items-center justify-center">
        <div className="h-16 w-16 animate-ping rounded-full bg-rose-500/20" />
        <div className="absolute h-12 w-12 animate-pulse rounded-full bg-rose-500/40" />
        <Heart className="absolute h-8 w-8 text-rose-500 animate-bounce" />
      </div>
      <p className="mt-4 text-sm font-medium text-muted-foreground animate-pulse">{message}</p>
    </div>
  );
};
