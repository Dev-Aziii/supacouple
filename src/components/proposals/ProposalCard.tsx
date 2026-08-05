import React from 'react';
import { SpontaneousProposal } from '@/types/proposal';
import { ProposalStatusBadge } from './ProposalStatusBadge';
import { ProposalReactions } from './ProposalReactions';
import { motion } from 'framer-motion';
import { Calendar, MapPin, DollarSign, ChevronRight, EyeOff } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ProposalCardProps {
  proposal: SpontaneousProposal;
  isSender: boolean;
  onClick: () => void;
  className?: string;
}

export const ProposalCard: React.FC<ProposalCardProps> = ({
  proposal,
  isSender,
  onClick,
  className,
}) => {
  const startDate = new Date(proposal.proposedTime);
  const isSurpriseHidden = proposal.isSurprise && !isSender && proposal.status === 'pending';

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={cn(
        'group cursor-pointer rounded-3xl border bg-card/60 backdrop-blur-md overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:border-pink-500/30 flex flex-col justify-between',
        proposal.status === 'pending' ? 'border-amber-500/20' : 'border-border/40',
        className
      )}
    >
      {/* Cover Banner Image */}
      {proposal.coverImage && !isSurpriseHidden ? (
        <div className="relative h-40 w-full overflow-hidden">
          <img
            src={proposal.coverImage}
            alt={proposal.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute top-3 right-3">
            <ProposalStatusBadge status={proposal.status} size="sm" />
          </div>
          <div className="absolute bottom-3 left-3 right-3">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-pink-500/80 text-white backdrop-blur-md">
              {proposal.category}
            </span>
          </div>
        </div>
      ) : (
        <div className="p-4 pb-0 flex items-center justify-between">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-pink-500/10 text-pink-400 border border-pink-500/20">
            {proposal.category}
          </span>
          <ProposalStatusBadge status={proposal.status} size="sm" />
        </div>
      )}

      {/* Main Content */}
      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          {isSurpriseHidden ? (
            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-center space-y-1">
              <EyeOff className="w-6 h-6 mx-auto text-purple-400" />
              <h4 className="text-sm font-bold">Surprise Proposal! 🎁</h4>
              <p className="text-xs text-purple-300/80">Accept this proposal to unlock full details</p>
            </div>
          ) : (
            <>
              <h3 className="text-base font-bold text-foreground group-hover:text-pink-400 transition-colors line-clamp-1">
                {proposal.title}
              </h3>
              {proposal.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {proposal.description}
                </p>
              )}
            </>
          )}

          {/* Details Row */}
          {!isSurpriseHidden && (
            <div className="flex flex-wrap items-center gap-y-1.5 gap-x-3 text-xs text-muted-foreground pt-1">
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-pink-400" />
                <span>
                  {startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at{' '}
                  {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {proposal.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-pink-400" />
                  <span className="truncate max-w-[140px]">{proposal.location}</span>
                </div>
              )}

              {proposal.estimatedCost && (
                <div className="flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-pink-400" />
                  <span>${proposal.estimatedCost}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer: Reactions & Arrow */}
        <div className="pt-3 border-t border-border/30 flex items-center justify-between">
          <ProposalReactions proposalId={proposal.id} />
          <div className="flex items-center gap-1 text-xs font-semibold text-pink-400 group-hover:translate-x-1 transition-transform">
            <span>View</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
