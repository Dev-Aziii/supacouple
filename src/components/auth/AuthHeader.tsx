import React from 'react';
import { Heart } from 'lucide-react';

interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="flex flex-col items-center text-center space-y-2 mb-6">
      <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 shadow-sm">
        <Heart className="h-6 w-6 fill-rose-500/20 stroke-[2.5]" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
        {title}
      </h1>
      <p className="text-sm text-muted-foreground max-w-xs sm:max-w-sm">
        {subtitle}
      </p>
    </div>
  );
};
