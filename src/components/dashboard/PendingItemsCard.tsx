import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BellRing, HeartHandshake, UserPlus, Check, X, Clock, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ButtonSpinner } from '@/components/ui/ButtonSpinner';
import { useSession } from '@/hooks/useSession';
import { useCouple } from '@/hooks/useCouple';
import { proposalService } from '@/services/proposals/proposalService';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import type { SpontaneousProposal } from '@/types/proposal';
import type { NotificationItem } from '@/services/repositories/notificationRepository';

export interface PendingInvitationItem {
  id: string;
  inviteCode: string;
}

interface PendingItemsCardProps {
  proposals: SpontaneousProposal[];
  invitations: PendingInvitationItem[];
  notifications: NotificationItem[];
  isLoading?: boolean;
  onAcceptProposal?: (id: string) => void;
  onDeclineProposal?: (id: string) => void;
  onCancelProposal?: (id: string) => Promise<void> | void;
}

export const PendingItemsCard: React.FC<PendingItemsCardProps> = ({
  proposals,
  invitations,
  notifications,
  isLoading = false,
  onAcceptProposal,
  onDeclineProposal,
  onCancelProposal,
}) => {
  const { user } = useSession();
  const { partner } = useCouple();
  const queryClient = useQueryClient();

  const [proposalToCancel, setProposalToCancel] = useState<SpontaneousProposal | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const totalPending = proposals.length + invitations.length + notifications.length;

  if (!isLoading && totalPending === 0) {
    return null;
  }

  const handleConfirmCancel = async () => {
    if (!proposalToCancel) return;
    setIsCancelling(true);
    try {
      if (onCancelProposal) {
        await onCancelProposal(proposalToCancel.id);
      } else {
        await proposalService.cancelProposal(proposalToCancel.id, partner?.id, user?.id);
        queryClient.invalidateQueries({ queryKey: queryKeys.proposals.all });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      }
      setProposalToCancel(null);
    } catch (err) {
      console.error('[PendingItemsCard] Failed to cancel proposal:', err);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <>
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <BellRing className="w-4 h-4 text-primary" />
            <span>Pending Action ({totalPending})</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Pending Proposals */}
          {proposals.map((proposal) => {
            const isSender = Boolean(user?.id && proposal.senderId === user.id);

            return (
              <motion.div
                key={proposal.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 bg-secondary/40 rounded-xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 overflow-hidden"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <HeartHandshake className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Date Proposal
                    </span>
                    <h5 className="text-sm font-semibold text-foreground truncate">
                      {proposal.title}
                    </h5>
                    <p className="text-xs text-muted-foreground truncate">
                      {proposal.proposedTime
                        ? `For ${new Date(proposal.proposedTime).toLocaleDateString()}`
                        : 'Pending date'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap justify-end">
                  {isSender ? (
                    <>
                      <span className="text-xs text-amber-500 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 shrink-0">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>Awaiting response</span>
                      </span>
                      <Button
                        type="button"
                        onClick={() => setProposalToCancel(proposal)}
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                        title="Cancel proposal"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        <span>Cancel</span>
                      </Button>
                    </>
                  ) : (
                    <>
                      {onAcceptProposal && (
                        <Button
                          onClick={() => onAcceptProposal(proposal.id)}
                          size="sm"
                          className="h-8 px-3 text-xs"
                        >
                          <Check className="w-3.5 h-3.5 mr-1" /> Accept
                        </Button>
                      )}
                      {onDeclineProposal && (
                        <Button
                          onClick={() => onDeclineProposal(proposal.id)}
                          size="sm"
                          variant="outline"
                          className="h-8 px-2 text-xs"
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}

          {/* Pending Invitations */}
          {invitations.map((invite) => (
            <div
              key={invite.id}
              className="p-3.5 bg-secondary/40 rounded-xl border border-border flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Partner Invitation
                  </span>
                  <h5 className="text-sm font-semibold text-foreground">
                    Invitation Code: {invite.inviteCode}
                  </h5>
                </div>
              </div>
            </div>
          ))}

          {/* Unread Notifications */}
          {notifications.slice(0, 3).map((notif) => (
            <div
              key={notif.id}
              className="p-3.5 bg-secondary/40 rounded-xl border border-border flex items-center justify-between"
            >
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                  {notif.type}
                </span>
                <h5 className="text-xs font-semibold text-foreground">{notif.title}</h5>
                <p className="text-xs text-muted-foreground line-clamp-1">{notif.body}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Cancel Proposal Confirmation Dialog */}
      {proposalToCancel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-3xl bg-card border border-border/80 shadow-2xl p-6 relative space-y-4 animate-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setProposalToCancel(null)}
              disabled={isCancelling}
              className="absolute top-4 right-4 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Close dialog"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-3 rounded-full bg-destructive/10 border border-destructive/20 text-destructive">
                <Trash2 className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-foreground">Cancel Proposal?</h3>
              <p className="text-xs text-muted-foreground">
                Are you sure you want to cancel proposal{' '}
                <strong className="text-foreground">"{proposalToCancel.title}"</strong>?
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setProposalToCancel(null)}
                disabled={isCancelling}
                className="flex-1 h-9 text-xs"
              >
                Keep Proposal
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="flex-1 h-9 text-xs gap-1.5"
              >
                {isCancelling ? <ButtonSpinner /> : null}
                Confirm & Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};


