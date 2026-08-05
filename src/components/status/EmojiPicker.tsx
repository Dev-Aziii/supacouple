import React, { useState } from 'react';
import { cn } from '@/utils/cn';
import { Input } from '@/components/ui/input';

const POPULAR_EMOJIS = [
  '💻', '🚗', '😴', '📚', '⛔', '🟢', '🏠', '🌿', '🛍️', '🍽️', '✈️', '🎮', '🏋️',
  '❤️', '🎉', '🔥', '💡', '☕', '🍕', '🎯', '✨', '🎧', '🛋️', '🎨', '🍿', '🚲'
];

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
  className?: string;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  value,
  onChange,
  className,
}) => {
  const [customEmoji, setCustomEmoji] = useState('');

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomEmoji(val);
    if (val.trim()) {
      onChange(val.trim());
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Select Emoji
        </label>
        <span className="text-xl leading-none p-1 rounded bg-muted/50 border border-border">
          {value || '💬'}
        </span>
      </div>

      <div className="grid grid-cols-7 gap-2 p-2 rounded-xl bg-muted/30 border border-border/50 max-h-36 overflow-y-auto">
        {POPULAR_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onChange(emoji)}
            className={cn(
              'h-10 w-10 text-xl flex items-center justify-center rounded-lg hover:bg-rose-500/10 hover:scale-110 transition-all duration-150',
              value === emoji ? 'bg-rose-500/20 border border-rose-500/40 scale-105 shadow-sm' : ''
            )}
            aria-label={`Select emoji ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Input
          type="text"
          placeholder="Or enter custom emoji..."
          value={customEmoji}
          onChange={handleCustomChange}
          maxLength={4}
          className="text-sm h-9"
        />
      </div>
    </div>
  );
};
