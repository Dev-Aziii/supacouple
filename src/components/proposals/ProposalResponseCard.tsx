import React, { useState } from 'react';
import { SpontaneousProposal } from '@/types/proposal';
import { ProposalStatusBadge } from './ProposalStatusBadge';
import { CounterProposalDialog } from './CounterProposalDialog';
import { Check, X, HelpCircle, RefreshCw, Sparkles, MessageSquare } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ProposalResponseCardProps {
  proposal: SpontaneousProposal;
  isPartner: boolean;
  onAccept: (id: string, note?: string) => Promise<void>;
  onDecline: (id: string, note?: string) => Promise<void>;
  onMaybe: (id: string, note?: string) => Promise<void>;
  onCounter: (data: {
    proposalId: string;
    proposedTime: string;
    endDatetime?: string;
    location?: string;
    description?: string;
    responseNote: string;
  }) => Promise<void>;
  className?: string;
}

export const ProposalResponseCard: React.FC<ProposalResponseCardProps> = ({
  proposal,
  isPartner,
  onAccept,
  onDecline,
  onMaybe,
  onCounter,
  className,
}) => {
  const [note, setNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAction = async (action: 'accept' | 'decline' | 'maybe') => {
    setIsSubmitting(true);
    try {
      if (action === 'accept') await onAccept(proposal.id, note.trim() || undefined);
      if (action === 'decline') await onDecline(proposal.id, note.trim() || undefined);
      if (action === 'maybe') await onMaybe(proposal.id, note.trim() || undefined);
    } catch (err) {
      console.error(`[ProposalResponseCard] ${action} failed:`, err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPending = proposal.status === 'pending';

  return (
    <div
      className={cn(
        'p-5 rounded-3xl border bg-card/60 backdrop-blur-md shadow-xl space-y-4',
        isPending ? 'border-pink-500/30 ring-1 ring-pink-500/20' : 'border-border/50',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-pink-400" />
          <span>Proposal Status</span>
        </h4>
        <ProposalStatusBadge status={proposal.status} size="md" />
      </div>

      {proposal.responseNote && (
        <div className="p-3 rounded-2xl bg-accent/40 border border-border/40 text-xs space-y-1">
          <span className="font-semibold text-muted-foreground flex items-center gap-1">
            <MessageSquare className="w-3 h-3 text-pink-400" /> Response Note:
          </span>
          <p className="text-foreground/90 italic">"{proposal.responseNote}"</p>
        </div>
      )}

      {/* Response Action Controls (Visible if proposal is pending and user is receiver/partner) */}
      {isPending && isPartner && (
        <div className="space-y-3 pt-2 border-t border-border/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">What's your response?</span>
            <button
              onClick={() => setShowNoteInput(!showNoteInput)}
              className="text-xs text-pink-400 hover:underline"
            >
              {showNoteInput ? 'Remove note' : '+ Add response note'}
            </button>
          </div>

          {showNoteInput && (
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Can't wait! I'll pick you up at 7 PM."
              className="w-full bg-accent/50 border border-border/50 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-pink-500"
            />
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => handleAction('accept')}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 transition-colors shadow-md shadow-emerald-500/20"
            >
              <Check className="w-4 h-4" />
              <span>Accept</span>
            </button>

            <button
              onClick={() => setShowCounterModal(true)}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-blue-500 text-white text-xs font-semibold hover:bg-blue-600 transition-colors shadow-md shadow-blue-500/20"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Counter</span>
            </button>

            <button
              onClick={() => handleAction('maybe')}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold hover:bg-purple-500/30 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Maybe</span>
            </button>

            <button
              onClick={() => handleAction('decline')}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold hover:bg-rose-500/30 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Decline</span>
            </button>
          </div>
        </div>
      )}

      {/* Counter Modal */}
      <CounterProposalDialog
        proposal={proposal}
        isOpen={showCounterModal}
        onClose={() => setShowCounterModal(false)}
        onCounter={onCounter}
      />
    </div>
  );
};
