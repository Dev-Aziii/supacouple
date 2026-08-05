import React from 'react';
import { Heart, Calendar, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatAnniversary } from '@/utils/relationship';

interface RelationshipSummaryProps {
  partnerName?: string;
  partnerAvatar?: string | null;
  anniversary?: string | null;
  daysTogether: number;
}

export const RelationshipSummary: React.FC<RelationshipSummaryProps> = ({
  partnerName,
  partnerAvatar,
  anniversary,
  daysTogether,
}) => {
  const formattedAnniversary = formatAnniversary(anniversary);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
          <Heart className="w-4 h-4 text-primary fill-primary" />
          <span>Relationship Summary</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {partnerName ? (
          <>
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-secondary/40 border border-border">
              <div className="w-10 h-10 rounded-full bg-secondary text-foreground font-semibold text-sm flex items-center justify-center overflow-hidden shrink-0 border border-border">
                {partnerAvatar ? (
                  <img src={partnerAvatar} alt={partnerName} className="w-full h-full object-cover" />
                ) : (
                  partnerName.charAt(0).toUpperCase()
                )}
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground">{partnerName}</h4>
                <p className="text-xs text-primary font-medium">Your Special Someone</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-secondary/30 rounded-xl border border-border">
                <span className="text-[11px] text-muted-foreground flex items-center justify-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  Days Together
                </span>
                <span className="text-lg font-bold text-primary block mt-0.5">
                  {daysTogether}
                </span>
              </div>

              <div className="p-3 bg-secondary/30 rounded-xl border border-border">
                <span className="text-[11px] text-muted-foreground flex items-center justify-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  Anniversary
                </span>
                <span className="text-xs font-semibold text-foreground truncate block mt-0.5">
                  {formattedAnniversary || 'Not set'}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-4 text-muted-foreground text-xs">
            Pair with your partner to unlock full relationship summary & anniversary tracking.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

