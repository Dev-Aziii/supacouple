import React, { useState, useEffect } from 'react';
import { SpontaneousProposal } from '@/types/proposal';
import { ProposalStatusBadge } from './ProposalStatusBadge';
import { ProposalGallery } from './ProposalGallery';
import { ProposalResponseCard } from './ProposalResponseCard';
import { ProposalTimeline } from './ProposalTimeline';
import { ProposalComments } from './ProposalComments';
import { ProposalReactions } from './ProposalReactions';
import { useSession } from '@/hooks/useSession';
import { useCouple } from '@/hooks/useCouple';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Shirt,
  CloudSun,
  EyeOff,
  Trash2,
  Edit,
  ExternalLink,
} from 'lucide-react';

interface ProposalDetailsProps {
  proposal: SpontaneousProposal | null;
  isOpen: boolean;
  onClose: () => void;
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
  onDelete?: (id: string) => Promise<void>;
  onEdit?: (proposal: SpontaneousProposal) => void;
}

export const ProposalDetails: React.FC<ProposalDetailsProps> = ({
  proposal,
  isOpen,
  onClose,
  onAccept,
  onDecline,
  onMaybe,
  onCounter,
  onDelete,
  onEdit,
}) => {
  const { user } = useSession();
  const { partner } = useCouple();
  const userId = user?.id;

  const [timeRemaining, setTimeRemaining] = useState('');

  const startDateStr = proposal?.proposedTime;

  // Countdown timer logic
  useEffect(() => {
    if (!startDateStr) return;
    const startDate = new Date(startDateStr);

    const updateTimer = () => {
      const diff = startDate.getTime() - Date.now();
      if (diff <= 0) {
        setTimeRemaining('Started / Event Time Reached');
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      setTimeRemaining(`${days}d ${hours}h ${minutes}m away`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [startDateStr]);

  if (!proposal) return null;

  const isSender = proposal.senderId === userId;
  const isPartner = !isSender;
  const startDate = new Date(proposal.proposedTime);
  const isSurpriseHidden = proposal.isSurprise && isPartner && proposal.status === 'pending';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-3xl my-8 bg-card border border-border/60 rounded-3xl overflow-hidden shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
          >
            {/* Header Banner */}
            <div className="relative">
              {proposal.coverImage && !isSurpriseHidden ? (
                <ProposalGallery coverImage={proposal.coverImage} title={proposal.title} className="rounded-b-none" />
              ) : (
                <div className="h-28 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-blue-500/20 p-6 flex items-end">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-pink-500/20 text-pink-300 border border-pink-500/30">
                    {proposal.category}
                  </span>
                </div>
              )}

              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-black/50 text-white hover:bg-black/80 backdrop-blur-md transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 pt-0">
              {/* Title & Metadata Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ProposalStatusBadge status={proposal.status} size="md" />
                    <span className="text-xs text-muted-foreground">
                      Proposed by <span className="font-semibold text-foreground">{isSender ? 'You' : partner?.displayName || 'Partner'}</span>
                    </span>
                  </div>

                  <h2 className="text-2xl font-black text-foreground">
                    {isSurpriseHidden ? 'Surprise Proposal! 🎁' : proposal.title}
                  </h2>
                </div>

                {/* Sender controls (Edit / Delete) */}
                {isSender && (
                  <div className="flex items-center gap-2">
                    {onEdit && proposal.status === 'pending' && (
                      <button
                        onClick={() => onEdit(proposal)}
                        className="p-2 rounded-xl bg-accent/50 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-xs font-medium"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={async () => {
                          if (confirm('Delete this proposal?')) {
                            await onDelete(proposal.id);
                            onClose();
                          }
                        }}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors flex items-center gap-1 text-xs font-medium"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Surprise Lock Notice */}
              {isSurpriseHidden ? (
                <div className="p-6 rounded-3xl bg-purple-500/10 border border-purple-500/30 text-center space-y-2">
                  <EyeOff className="w-10 h-10 mx-auto text-purple-400" />
                  <h3 className="text-base font-bold text-purple-200">This is a Surprise Proposal!</h3>
                  <p className="text-xs text-purple-300/80 max-w-md mx-auto">
                    Your partner created this as a secret surprise date. Accept the proposal below to reveal location, details, and dress code!
                  </p>
                </div>
              ) : (
                <>
                  {/* Countdown pill */}
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-semibold">
                    <Clock className="w-4 h-4" />
                    <span>Countdown: {timeRemaining}</span>
                  </div>

                  {/* Description */}
                  {proposal.description && (
                    <div className="p-4 rounded-2xl bg-accent/30 border border-border/40 space-y-1">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Description & Details
                      </h4>
                      <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                        {proposal.description}
                      </p>
                    </div>
                  )}

                  {/* Key Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-2xl bg-accent/20 border border-border/40 flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-400">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold">Date & Time</p>
                        <p className="text-xs font-bold text-foreground">
                          {startDate.toLocaleDateString()} at {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    {proposal.location && (
                      <div className="p-3.5 rounded-2xl bg-accent/20 border border-border/40 flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-400">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-[10px] text-muted-foreground uppercase font-semibold">Location</p>
                          <a
                            href={`https://maps.google.com/?q=${encodeURIComponent(proposal.location)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-pink-400 hover:underline flex items-center gap-1 truncate"
                          >
                            <span className="truncate">{proposal.location}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        </div>
                      </div>
                    )}

                    {proposal.estimatedCost && (
                      <div className="p-3.5 rounded-2xl bg-accent/20 border border-border/40 flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-400">
                          <DollarSign className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-semibold">Estimated Cost</p>
                          <p className="text-xs font-bold text-foreground">${proposal.estimatedCost}</p>
                        </div>
                      </div>
                    )}

                    {proposal.dressCode && (
                      <div className="p-3.5 rounded-2xl bg-accent/20 border border-border/40 flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-400">
                          <Shirt className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-semibold">Dress Code</p>
                          <p className="text-xs font-bold text-foreground">{proposal.dressCode}</p>
                        </div>
                      </div>
                    )}

                    {proposal.weatherRequired && (
                      <div className="p-3.5 rounded-2xl bg-accent/20 border border-border/40 flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-400">
                          <CloudSun className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-semibold">Weather Needed</p>
                          <p className="text-xs font-bold text-foreground">{proposal.weatherRequired}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Partner Response Card */}
              <ProposalResponseCard
                proposal={proposal}
                isPartner={isPartner}
                onAccept={onAccept}
                onDecline={onDecline}
                onMaybe={onMaybe}
                onCounter={onCounter}
              />

              {/* Emoji Reactions */}
              <div className="p-4 rounded-2xl bg-accent/20 border border-border/40 space-y-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Partner Reactions
                </span>
                <ProposalReactions proposalId={proposal.id} />
              </div>

              {/* Proposal History Tree */}
              <ProposalTimeline proposal={proposal} />

              {/* Comments & Discussion */}
              <ProposalComments proposalId={proposal.id} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
