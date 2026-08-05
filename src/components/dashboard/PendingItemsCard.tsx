import React from 'react';
import { motion } from 'framer-motion';
import { BellRing, Gift, UserPlus, Check, X } from 'lucide-react';
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
    return null; // Hide card when no pending items to keep dashboard clean
  }

  return (
    <Card className="border-amber-200 dark:border-amber-900/40 bg-amber-50/20 dark:bg-amber-950/10 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-white">
          <BellRing className="w-5 h-5 text-amber-500" />
          Pending Items ({totalPending})
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Pending Proposals */}
        {proposals.map((proposal) => (
          <motion.div
            key={proposal.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-white dark:bg-gray-900 rounded-xl border border-amber-200 dark:border-amber-900/40 shadow-xs flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 flex items-center justify-center flex-shrink-0">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600">
                  Date Proposal
                </span>
                <h5 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">
                  {proposal.title}
                </h5>
                <p className="text-xs text-gray-500">
                  {proposal.proposedTime
                    ? `For ${new Date(proposal.proposedTime).toLocaleDateString()}`
                    : 'Pending date'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              {onAcceptProposal && (
                <Button
                  onClick={() => onAcceptProposal(proposal.id)}
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 text-white rounded-full h-8 px-3 text-xs"
                >
                  <Check className="w-3.5 h-3.5 mr-1" /> Accept
                </Button>
              )}
              {onDeclineProposal && (
                <Button
                  onClick={() => onDeclineProposal(proposal.id)}
                  size="sm"
                  variant="outline"
                  className="border-gray-200 rounded-full h-8 px-2 text-xs text-gray-500"
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
            className="p-3 bg-white dark:bg-gray-900 rounded-xl border border-pink-200 dark:border-pink-900/40 shadow-xs flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-pink-600">
                  Partner Invitation
                </span>
                <h5 className="text-sm font-bold text-gray-900 dark:text-white">
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
            className="p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-xs flex items-center justify-between"
          >
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-pink-500">
                {notif.type}
              </span>
              <h5 className="text-xs font-bold text-gray-900 dark:text-white">{notif.title}</h5>
              <p className="text-xs text-gray-500 line-clamp-1">{notif.body}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
