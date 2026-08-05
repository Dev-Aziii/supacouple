import React from 'react';
import { Send, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProposalEmptyStateProps {
  onCreateClick?: () => void;
  title?: string;
  description?: string;
}

export const ProposalEmptyState: React.FC<ProposalEmptyStateProps> = ({
  onCreateClick,
  title = 'No proposals yet',
  description = 'Surprise your partner with a romantic date idea, weekend getaway, or fun activity!',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-12 text-center rounded-3xl bg-card/30 border border-border/40 space-y-4"
    >
      <div className="w-16 h-16 rounded-full bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 shadow-xl shadow-pink-500/10">
        <Send className="w-8 h-8" />
      </div>

      <div className="max-w-sm space-y-1">
        <h3 className="text-base font-bold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>

      {onCreateClick && (
        <button
          onClick={onCreateClick}
          className="mt-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg shadow-pink-500/25 flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Create First Proposal</span>
        </button>
      )}
    </motion.div>
  );
};
