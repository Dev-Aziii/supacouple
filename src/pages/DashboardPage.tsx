import React from 'react';
import { User as UserIcon, LogOut } from 'lucide-react';
import { useSession } from '@/hooks/useSession';
import { useSignOut } from '@/hooks/useSignOut';
import { Button } from '@/components/ui/button';
import { ButtonSpinner } from '@/components/ui/ButtonSpinner';

export const DashboardPage: React.FC = () => {
  const { user, profile } = useSession();
  const { mutate: signOut, isPending } = useSignOut();

  const email = user?.email || 'No email';
  const name = profile?.displayName || user?.user_metadata?.display_name || 'User';

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
      <div className="w-full max-w-md p-8 rounded-3xl bg-card border border-border/60 shadow-xl space-y-6">
        {/* Avatar Placeholder */}
        <div className="relative mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-rose-500/10 border-2 border-rose-500/30 text-rose-500 shadow-md">
          {profile?.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={name}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <UserIcon className="h-12 w-12 stroke-[1.5]" />
          )}
        </div>

        {/* Welcome Message & User Email */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome, {name}!
          </h1>
          <p className="text-sm font-medium text-muted-foreground">{email}</p>
        </div>

        {/* Logout Button */}
        <Button
          variant="destructive"
          onClick={() => signOut()}
          disabled={isPending}
          className="w-full bg-rose-600 hover:bg-rose-700 text-white gap-2 transition-all"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <ButtonSpinner />
              Logging out...
            </span>
          ) : (
            <>
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default DashboardPage;
