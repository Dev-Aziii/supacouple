import React from 'react';
import { motion } from 'framer-motion';
import type { MemoryReaction } from '../../types/memory';

interface MemoryReactionsProps {
  reactions: MemoryReaction[];
  currentUserId?: string;
  onReact: (emoji: string) => void;
  onRemove: () => void;
}

const COMMON_EMOJIS = ['❤️', '💖', '🥰', '😍', '🔥', '✨', '🎉', '🥂'];

export const MemoryReactions: React.FC<MemoryReactionsProps> = ({
  reactions,
  currentUserId,
  onReact,
  onRemove,
}) => {
  // Count reaction occurrences
  const emojiCounts: Record<string, { count: number; userReacted: boolean }> = {};

  reactions.forEach((r) => {
    if (!emojiCounts[r.emoji]) {
      emojiCounts[r.emoji] = { count: 0, userReacted: false };
    }
    emojiCounts[r.emoji].count += 1;
    if (r.userId === currentUserId) {
      emojiCounts[r.emoji].userReacted = true;
    }
  });

  return (
    <div className="flex flex-wrap items-center gap-1.5 py-2">
      {Object.entries(emojiCounts).map(([emoji, data]) => (
        <motion.button
          key={emoji}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (data.userReacted) {
              onRemove();
            } else {
              onReact(emoji);
            }
          }}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
            data.userReacted
              ? 'bg-rose-500/15 border-rose-500/40 text-rose-600 dark:text-rose-400 shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-rose-300'
          }`}
        >
          <span>{emoji}</span>
          <span className="text-[11px] font-semibold">{data.count}</span>
        </motion.button>
      ))}

      <div className="flex items-center gap-1 ml-1 overflow-x-auto py-1">
        {COMMON_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onReact(emoji)}
            className="hover:scale-125 transition-transform p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-sm"
            title={`React ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};
