import React from 'react';
import type { Invitation } from '@/services/repositories/invitationsRepository';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ButtonSpinner } from '@/components/ui/ButtonSpinner';
import { Clock, Send, Mail, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface InviteCardProps {
  invitation: Invitation;
  type: 'sent' | 'received';
  onAccept?: (code: string) => void;
  onDecline?: (id: string) => void;
  onCancel?: (id: string) => void;
  isAccepting?: boolean;
  isDeclining?: boolean;
  isCancelling?: boolean;
}

export const InviteCard: React.FC<InviteCardProps> = ({
  invitation,
  type,
  onAccept,
  onDecline,
  onCancel,
  isAccepting = false,
  isDeclining = false,
  isCancelling = false,
}) => {
  const isExpired = new Date(invitation.expiresAt).getTime() < Date.now();
  const displayStatus = isExpired && invitation.status === 'pending' ? 'expired' : invitation.status;

  const formattedDate = new Date(invitation.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Card className="border-border/60 hover:border-rose-500/30 transition-all">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <div className="flex items-center gap-2">
          {type === 'sent' ? (
            <Send className="h-4 w-4 text-sky-500" />
          ) : (
            <Mail className="h-4 w-4 text-rose-500" />
          )}
          <CardTitle className="text-sm font-semibold">
            {type === 'sent' ? `Sent to ${invitation.email}` : `Received Invitation`}
          </CardTitle>
        </div>

        <span
          className={cn(
            'px-2.5 py-0.5 rounded-full text-xs font-medium border',
            displayStatus === 'pending' && 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800',
            displayStatus === 'accepted' && 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
            displayStatus === 'declined' && 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
            (displayStatus === 'expired' || displayStatus === 'cancelled') && 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400'
          )}
        >
          {displayStatus.toUpperCase()}
        </span>
      </CardHeader>

      <CardContent className="space-y-3 pt-2">
        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 text-xs font-mono">
          <span className="text-muted-foreground font-sans">Invite Code:</span>
          <span className="font-bold text-sm text-foreground tracking-widest">{invitation.inviteCode}</span>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>Sent: {formattedDate}</span>
          </div>

          {displayStatus === 'pending' && (
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              Expires in 7 days
            </span>
          )}
        </div>

        {/* Action Buttons for Received pending invite */}
        {type === 'received' && displayStatus === 'pending' && (
          <div className="flex items-center gap-2 pt-2">
            <Button
              type="button"
              onClick={() => onAccept?.(invitation.inviteCode)}
              disabled={isAccepting || isDeclining}
              className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-xs gap-1.5"
            >
              {isAccepting ? (
                <>
                  <ButtonSpinner />
                  <span>Accepting...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Accept</span>
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => onDecline?.(invitation.id)}
              disabled={isAccepting || isDeclining}
              className="flex-1 text-xs gap-1.5 border-slate-300 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {isDeclining ? (
                <>
                  <ButtonSpinner />
                  <span>Declining...</span>
                </>
              ) : (
                <>
                  <XCircle className="h-3.5 w-3.5 text-rose-500" />
                  <span>Decline</span>
                </>
              )}
            </Button>
          </div>
        )}

        {/* Action Buttons for Sent pending invite */}
        {type === 'sent' && displayStatus === 'pending' && onCancel && (
          <div className="pt-2 flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onCancel(invitation.id)}
              disabled={isCancelling}
              className="text-xs text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 gap-1.5 p-0 h-auto"
            >
              {isCancelling ? (
                <>
                  <ButtonSpinner />
                  <span>Cancelling...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Cancel Invitation</span>
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
