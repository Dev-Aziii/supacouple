import React from 'react';
import { motion } from 'framer-motion';
import { BellRing, HeartHandshake, UserPlus, Check, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
}

export const PendingItemsCard: React.FC<PendingItemsCardProps> = ({
  proposals,
  invitations,
  notifications,
  isLoading = false,
  onAcceptProposal,
  onDeclineProposal,
}) => {
  const totalPending = proposals.length + invitations.length + notifications.length;

  if (!isLoading && totalPending === 0) {
    return null;
  }

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
          <BellRing className="w-4 h-4 text-primary" />
          <span>Pending Action ({totalPending})</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Pending Proposals */}
        {proposals.map((proposal) => (
          <motion.div
            key={proposal.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 bg-secondary/40 rounded-xl border border-border flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Date Proposal
                </span>
                <h5 className="text-sm font-semibold text-foreground line-clamp-1">
                  {proposal.title}
                </h5>
                <p className="text-xs text-muted-foreground">
                  {proposal.proposedTime
                    ? `For ${new Date(proposal.proposedTime).toLocaleDateString()}`
                    : 'Pending date'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
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
            </div>
          </motion.div>
        ))}

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
  );
};

