import React, { useState, useEffect } from 'react';
import { ProposalReaction } from '@/types/proposal';
import { proposalService } from '@/services/proposals/proposalService';
import { useSession } from '@/hooks/useSession';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';

interface ProposalReactionsProps {
  proposalId: string;
  className?: string;
}

const EMOJI_OPTIONS = ['❤️', '😍', '🥰', '🔥', '👏', '😂'];

export const ProposalReactions: React.FC<ProposalReactionsProps> = ({ proposalId, className }) => {
  const { user } = useSession();
  const userId = user?.id;
  const [reactions, setReactions] = useState<ProposalReaction[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    proposalService.getReactions(proposalId).then((data) => {
      if (isMounted) setReactions(data);
    });
    return () => {
      isMounted = false;
    };
  }, [proposalId]);

  const handleToggleEmoji = async (emoji: string) => {
    if (!userId || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const updated = await proposalService.toggleReaction(proposalId, userId, emoji);
      setReactions(updated);
    } catch (err) {
      console.error('[ProposalReactions] Reaction toggle failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group reaction counts
  const reactionCounts = EMOJI_OPTIONS.map((emoji) => {
    const matching = reactions.filter((r) => r.emoji === emoji);
    const hasReacted = Boolean(userId && matching.some((r) => r.userId === userId));
    return {
      emoji,
      count: matching.length,
      hasReacted,
    };
  });

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {reactionCounts.map(({ emoji, count, hasReacted }) => (
        <motion.button
          key={emoji}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1 }}
          onClick={() => handleToggleEmoji(emoji)}
          disabled={isSubmitting}
          className={cn(
            'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all',
            hasReacted
              ? 'bg-pink-500/20 text-pink-300 border-pink-500/40 shadow-sm shadow-pink-500/20'
              : 'bg-accent/40 text-muted-foreground border-border/50 hover:bg-accent hover:text-foreground'
          )}
        >
          <span className="text-sm">{emoji}</span>
          <AnimatePresence mode="wait">
            {count > 0 && (
              <motion.span
                key={count}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
              >
                {count}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      ))}
    </div>
  );
};
