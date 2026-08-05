import React from 'react';
import { Button } from '@/components/ui/button';

export const SocialAuthPlaceholder: React.FC = () => {
  return (
    <div className="w-full space-y-4">
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border/60" />
        </div>
        <div className="relative bg-card px-3 text-xs uppercase text-muted-foreground tracking-wider font-semibold">
          Or continue with
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        disabled
        className="w-full flex items-center justify-center gap-2 opacity-60 cursor-not-allowed"
        aria-label="Google authentication coming soon"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.761H12.545z"
          />
        </svg>
        <span>Google (Coming Soon)</span>
      </Button>
    </div>
  );
};
