import React, { useState } from 'react';
import type { Invitation } from '@/services/repositories/invitationsRepository';
import { InviteCard } from './InviteCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Mail, Send, Inbox } from 'lucide-react';
import { cn } from '@/utils/cn';

interface InvitationListProps {
  sent: Invitation[];
  received: Invitation[];
  onAccept?: (code: string) => void;
  onDecline?: (id: string) => void;
  onCancel?: (id: string) => void;
  isAccepting?: boolean;
  isDeclining?: boolean;
  isCancelling?: boolean;
  className?: string;
}

export const InvitationList: React.FC<InvitationListProps> = ({
  sent,
  received,
  onAccept,
  onDecline,
  onCancel,
  isAccepting,
  isDeclining,
  isCancelling,
  className,
}) => {
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');

  const activeList = activeTab === 'received' ? received : sent;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Inbox className="h-5 w-5 text-rose-500" />
              <span>Pending Invitations</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Manage sent and received partner connection requests.
            </CardDescription>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-muted/60 border border-border/40 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('received')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all',
                activeTab === 'received'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Mail className="h-3.5 w-3.5" />
              <span>Received ({received.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('sent')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all',
                activeTab === 'sent'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Send className="h-3.5 w-3.5" />
              <span>Sent ({sent.length})</span>
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {activeList.length === 0 ? (
          <div className="py-8 text-center border-2 border-dashed border-border/40 rounded-2xl p-6">
            <Inbox className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm font-medium text-muted-foreground">
              No pending {activeTab} invitations
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              {activeTab === 'received'
                ? 'When a partner sends you an invite code, it will appear here.'
                : 'Send an invitation to your partner using the form above.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeList.map((invitation) => (
              <InviteCard
                key={invitation.id}
                invitation={invitation}
                type={activeTab}
                onAccept={onAccept}
                onDecline={onDecline}
                onCancel={onCancel}
                isAccepting={isAccepting}
                isDeclining={isDeclining}
                isCancelling={isCancelling}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
