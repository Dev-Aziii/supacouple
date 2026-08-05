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
    <Card className="border-pink-200 dark:border-pink-900/30 shadow-sm bg-gradient-to-br from-pink-50/40 via-white to-rose-50/30 dark:from-pink-950/20 dark:to-gray-900">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-white">
          <Heart className="w-5 h-5 fill-pink-500 text-pink-500" />
          Relationship Summary
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {partnerName ? (
          <>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-900 border border-pink-100 dark:border-pink-900/40">
              <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/50 text-pink-700 font-bold text-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                {partnerAvatar ? (
                  <img src={partnerAvatar} alt={partnerName} className="w-full h-full object-cover" />
                ) : (
                  partnerName.charAt(0).toUpperCase()
                )}
              </div>

              <div>
                <h4 className="text-base font-bold text-gray-900 dark:text-white">{partnerName}</h4>
                <p className="text-xs text-pink-600 dark:text-pink-400 font-medium">Your Special Someone</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                <span className="text-xs text-gray-500 flex items-center justify-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-pink-500" />
                  Days Together
                </span>
                <span className="text-xl font-extrabold text-pink-600 dark:text-pink-400">
                  {daysTogether}
                </span>
              </div>

              <div className="p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                <span className="text-xs text-gray-500 flex items-center justify-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-rose-500" />
                  Anniversary
                </span>
                <span className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1 mt-0.5">
                  {formattedAnniversary || 'Not set'}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-4 text-gray-500 text-sm">
            Pair with your partner to unlock full relationship summary & anniversary tracking.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
