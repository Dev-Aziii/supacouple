import React from 'react';
import type { UserProfile } from '@/types/user';
import type { Couple } from '@/services/repositories/couplesRepository';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { calculateRelationshipDays, formatAnniversary } from '@/utils/relationship';
import { User, Calendar, Heart, LogOut } from 'lucide-react';

interface PartnerCardProps {
  partner: UserProfile;
  couple?: Couple | null;
  onLeaveRelationship?: () => void;
  className?: string;
}

export const PartnerCard: React.FC<PartnerCardProps> = ({
  partner,
  couple,
  onLeaveRelationship,
  className,
}) => {
  const name = partner.displayName || 'Your Partner';
  const anniversaryDate = couple?.anniversary;
  const daysTogether = calculateRelationshipDays(anniversaryDate || couple?.createdAt);
  const formattedAnniversary = formatAnniversary(anniversaryDate);

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-center h-16 w-16 rounded-full bg-rose-500/10 border-2 border-rose-500/30 text-rose-500 shadow-md">
            {partner.avatarUrl ? (
              <img
                src={partner.avatarUrl}
                alt={name}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <User className="h-8 w-8 stroke-[1.5]" />
            )}
            <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-emerald-500 border-2 border-card" title="Active Partner" />
          </div>

          <div>
            <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <span>{name}</span>
              <Heart className="h-4 w-4 text-rose-500 fill-rose-500 inline" />
            </CardTitle>
            <p className="text-sm font-medium text-muted-foreground">{partner.email}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Days Together Stat Box */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-purple-500/10 border border-rose-500/20 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              Days Together
            </span>
            <div className="text-2xl font-extrabold text-foreground">
              {daysTogether} {daysTogether === 1 ? 'day' : 'days'}
            </div>
          </div>
          <Heart className="h-8 w-8 text-rose-500/30 fill-rose-500/10 stroke-[1.5]" />
        </div>

        {/* Anniversary Box */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4 text-rose-500" />
            <span className="font-medium">Anniversary Date:</span>
          </div>
          <span className="font-semibold text-foreground">{formattedAnniversary}</span>
        </div>
      </CardContent>

      {onLeaveRelationship && (
        <CardFooter className="pt-2 border-t border-border/40 justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onLeaveRelationship}
            className="text-xs text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 gap-1.5"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Leave Relationship</span>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
