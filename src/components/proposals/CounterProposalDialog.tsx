import React, { useState } from 'react';
import { SpontaneousProposal } from '@/types/proposal';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, Calendar, Clock, MapPin, AlignLeft, Send } from 'lucide-react';

interface CounterProposalDialogProps {
  proposal: SpontaneousProposal | null;
  isOpen: boolean;
  onClose: () => void;
  onCounter: (data: {
    proposalId: string;
    proposedTime: string;
    endDatetime?: string;
    location?: string;
    description?: string;
    responseNote: string;
  }) => Promise<void>;
}

export const CounterProposalDialog: React.FC<CounterProposalDialogProps> = ({
  proposal,
  isOpen,
  onClose,
  onCounter,
}) => {
  const initialStart = proposal?.proposedTime ? new Date(proposal.proposedTime) : new Date();
  const [date, setDate] = useState(initialStart.toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState(initialStart.toTimeString().slice(0, 5));
  const [location, setLocation] = useState(proposal?.location || '');
  const [description, setDescription] = useState(proposal?.description || '');
  const [responseNote, setResponseNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!proposal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!responseNote.trim()) return;

    setIsSubmitting(true);
    try {
      const combinedStart = new Date(`${date}T${startTime}:00`).toISOString();
      await onCounter({
        proposalId: proposal.id,
        proposedTime: combinedStart,
        location: location.trim() || undefined,
        description: description.trim() || undefined,
        responseNote: responseNote.trim(),
      });
      onClose();
    } catch (err) {
      console.error('[CounterProposalDialog] Counter submission failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-lg bg-card border border-border/60 rounded-3xl p-6 shadow-2xl space-y-6"
          >
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <div className="flex items-center gap-2 text-blue-400">
                <RefreshCw className="w-5 h-5" />
                <h3 className="text-lg font-bold text-foreground">Counter Proposal</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-accent/60 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Original Proposal: <span className="font-semibold text-foreground">"{proposal.title}"</span>
              </p>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-pink-400" /> New Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full bg-accent/40 border border-border/50 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-pink-400" /> New Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    className="w-full bg-accent/40 border border-border/50 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500/50"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-pink-400" /> New Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Suggest a alternate spot..."
                  className="w-full bg-accent/40 border border-border/50 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500/50"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <AlignLeft className="w-3.5 h-3.5 text-pink-400" /> Updated Details
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Add details about your alternative..."
                  className="w-full bg-accent/40 border border-border/50 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500/50"
                />
              </div>

              {/* Counter Message / Note */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Reason / Note to Partner <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={responseNote}
                  onChange={(e) => setResponseNote(e.target.value)}
                  required
                  placeholder="e.g. How about Saturday instead? I'm busy Friday!"
                  className="w-full bg-accent/40 border border-border/50 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500/50"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!responseNote.trim() || isSubmitting}
                  className="px-5 py-2 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-1.5 text-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Counter Proposal</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
