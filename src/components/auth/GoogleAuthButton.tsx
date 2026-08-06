import React from 'react';
import { Button } from '@/components/ui/button';
import { ButtonSpinner } from '@/components/ui/ButtonSpinner';
import { useGoogleSignIn } from '@/hooks/useGoogleSignIn';

interface GoogleAuthButtonProps {
  redirectTo?: string;
  label?: string;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  redirectTo,
  label = 'Continue with Google',
}) => {
  const { mutate: googleSignIn, isPending } = useGoogleSignIn();

  const handleGoogleSignIn = () => {
    googleSignIn(redirectTo);
  };

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
        disabled={isPending}
        onClick={handleGoogleSignIn}
        className="w-full flex items-center justify-center gap-2.5 bg-background border-input hover:bg-accent hover:text-accent-foreground font-medium transition-all shadow-sm active:scale-[0.99]"
        aria-label="Sign in with Google"
      >
        {isPending ? (
          <span className="flex items-center gap-2">
            <ButtonSpinner />
            <span>Connecting to Google...</span>
          </span>
        ) : (
          <>
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.21 0 10.05 0 12s.47 3.79 1.29 5.42l3.99-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>{label}</span>
          </>
        )}
      </Button>
    </div>
  );
};
