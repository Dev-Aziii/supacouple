import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { RelationshipBadge } from './RelationshipBadge';
import type { RelationshipStatusType } from '@/store/relationshipStore';
import { Heart, UserX, Clock, Sparkles } from 'lucide-react';

interface RelationshipStatusProps {
  status: RelationshipStatusType;
  relationshipName?: string;
  partnerName?: string;
  className?: string;
}

export const RelationshipStatus: React.FC<RelationshipStatusProps> = ({
  status,
  relationshipName,
  partnerName,
  className,
}) => {
  const getHeaderInfo = () => {
    switch (status) {
      case 'partnered':
        return {
          icon: <Heart className="h-6 w-6 text-rose-500 fill-rose-500/20" />,
          title: relationshipName || `Paired with ${partnerName || 'your partner'}`,
          description: 'You are connected as a couple. Share plans, memories, and proposals together.',
        };
      case 'invited':
        return {
          icon: <Sparkles className="h-6 w-6 text-amber-500" />,
          title: 'Invitation Waiting',
          description: 'Someone has invited you to pair! Enter or accept their invite code below.',
        };
      case 'pending':
        return {
          icon: <Clock className="h-6 w-6 text-sky-500" />,
          title: 'Invitation Sent',
          description: 'Waiting for your partner to enter or accept your invitation code.',
        };
      case 'ended':
        return {
          icon: <UserX className="h-6 w-6 text-slate-400" />,
          title: 'Previous Relationship Ended',
          description: 'You are currently single. You can send or accept a new couple invitation anytime.',
        };
      case 'single':
      default:
        return {
          icon: <Heart className="h-6 w-6 text-rose-400/60" />,
          title: 'Not Paired Yet',
          description: 'Connect with your partner to unlock shared memories, calendars, and date planning.',
        };
    }
  };

  const info = getHeaderInfo();

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20">
            {info.icon}
          </div>
          <div>
            <CardTitle className="text-lg font-bold">{info.title}</CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              {info.description}
            </CardDescription>
          </div>
        </div>
        <RelationshipBadge status={status} />
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-1 w-full bg-gradient-to-r from-rose-500/20 via-rose-500 to-rose-500/20 rounded-full" />
      </CardContent>
    </Card>
  );
};
