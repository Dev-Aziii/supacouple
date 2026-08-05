import React from 'react';
import { CreateProposalDTO, SpontaneousProposal } from '@/types/proposal';
import { ProposalForm } from './ProposalForm';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';

interface ProposalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<CreateProposalDTO, 'coupleId' | 'senderId'>) => Promise<void>;
  initialValues?: Partial<SpontaneousProposal>;
  isSubmitting?: boolean;
}

export const ProposalDialog: React.FC<ProposalDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialValues,
  isSubmitting = false,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="w-full max-w-2xl my-8 bg-card border border-border/60 rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-2xl bg-pink-500/10 text-pink-400">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    {initialValues ? 'Edit Proposal' : 'Create Date or Trip Proposal'}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Invite your partner to a special date, trip, or activity
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-accent/60 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ProposalForm
              initialValues={initialValues}
              onSubmit={async (data) => {
                await onSubmit(data);
                onClose();
              }}
              onCancel={onClose}
              isSubmitting={isSubmitting}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
