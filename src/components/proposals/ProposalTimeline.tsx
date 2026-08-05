import React, { useState, useEffect } from 'react';
import { SpontaneousProposal } from '@/types/proposal';
import { proposalRepository } from '@/services/repositories/proposalRepository';
import { ProposalStatusBadge } from './ProposalStatusBadge';
import { History, Calendar, MapPin } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ProposalTimelineProps {
  proposal: SpontaneousProposal;
  className?: string;
}

export const ProposalTimeline: React.FC<ProposalTimelineProps> = ({ proposal, className }) => {
  const [history, setHistory] = useState<SpontaneousProposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    proposalRepository.getHistory(proposal.id).then((items) => {
      if (isMounted) {
        setHistory(items);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [proposal.id]);

  if (isLoading || history.length <= 1) return null;

  return (
    <div className={cn('p-5 rounded-3xl bg-accent/20 border border-border/40 space-y-4', className)}>
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <History className="w-4 h-4 text-blue-400" />
        <span>Proposal Revision History ({history.length})</span>
      </div>

      <div className="relative pl-4 border-l-2 border-blue-500/30 space-y-4">
        {history.map((item, idx) => {
          const isCurrent = item.id === proposal.id;
          const startDate = new Date(item.proposedTime);

          return (
            <div key={item.id} className="relative space-y-1">
              <span
                className={cn(
                  'absolute -left-[21px] top-1.5 w-3 h-3 rounded-full border-2 bg-background',
                  isCurrent ? 'border-pink-400 bg-pink-500' : 'border-blue-400'
                )}
              />
              <div className="flex items-center justify-between">
                <span className={cn('text-xs font-semibold', isCurrent ? 'text-pink-400' : 'text-foreground')}>
                  Version {idx + 1}: {item.title} {isCurrent && '(Current)'}
                </span>
                <ProposalStatusBadge status={item.status} size="sm" />
              </div>

              <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {startDate.toLocaleDateString()} at {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {item.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {item.location}
                  </span>
                )}
              </div>

              {item.responseNote && (
                <p className="text-xs text-muted-foreground italic bg-accent/40 rounded-lg p-2 mt-1">
                  "{item.responseNote}"
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
