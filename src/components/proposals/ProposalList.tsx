import React from 'react';
import { SpontaneousProposal } from '@/types/proposal';
import { ProposalCard } from './ProposalCard';
import { ProposalEmptyState } from './ProposalEmptyState';
import { motion, AnimatePresence } from 'framer-motion';

interface ProposalListProps {
  proposals: SpontaneousProposal[];
  currentUserId: string;
  isLoading?: boolean;
  onProposalClick: (proposal: SpontaneousProposal) => void;
  onCreateClick?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

export const ProposalList: React.FC<ProposalListProps> = ({
  proposals,
  currentUserId,
  isLoading = false,
  onProposalClick,
  onCreateClick,
  emptyTitle,
  emptyDescription,
  className,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div
            key={n}
            className="h-64 rounded-3xl bg-accent/30 border border-border/40 animate-pulse p-5 space-y-4"
          >
            <div className="h-28 bg-accent/50 rounded-2xl" />
            <div className="h-4 w-3/4 bg-accent/50 rounded-lg" />
            <div className="h-3 w-1/2 bg-accent/50 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (proposals.length === 0) {
    return (
      <ProposalEmptyState
        onCreateClick={onCreateClick}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 ${className}`}>
      <AnimatePresence>
        {proposals.map((proposal) => (
          <motion.div
            key={proposal.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            layout
          >
            <ProposalCard
              proposal={proposal}
              isSender={proposal.senderId === currentUserId}
              onClick={() => onProposalClick(proposal)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
