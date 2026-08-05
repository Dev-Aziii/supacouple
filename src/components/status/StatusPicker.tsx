import React, { useState } from 'react';
import { PRESET_STATUSES, PresetStatusConfig, PresetStatusType, ExpirationOption } from '@/types/status';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmojiPicker } from './EmojiPicker';
import { ExpirationSelector } from './ExpirationSelector';
import { calculateExpiresAt } from '@/utils/status';
import { StatusChip } from './StatusChip';
import { Sparkles, X, Check } from 'lucide-react';
import { cn } from '@/utils/cn';

interface StatusPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStatus: (payload: {
    statusType?: PresetStatusType;
    mood?: string;
    statusMessage?: string;
    expiresAt?: string | null;
  }) => Promise<void>;
  initialStatus?: {
    statusType?: PresetStatusType;
    mood?: string | null;
    statusMessage?: string | null;
    expiresAt?: string | null;
  } | null;
  history?: Array<{ emoji?: string | null; statusMessage?: string | null }>;
}

export const StatusPicker: React.FC<StatusPickerProps> = ({
  isOpen,
  onClose,
  onSelectStatus,
  initialStatus,
  history = [],
}) => {
  const [selectedPreset, setSelectedPreset] = useState<PresetStatusConfig | null>(() => {
    if (initialStatus?.statusType && initialStatus.statusType !== 'custom') {
      return PRESET_STATUSES.find((p) => p.type === initialStatus.statusType) || null;
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState<'common' | 'recent' | 'custom'>('common');
  const [emoji, setEmoji] = useState<string>(initialStatus?.mood || selectedPreset?.emoji || '💬');
  const [statusMessage, setStatusMessage] = useState<string>(initialStatus?.statusMessage || '');
  const [expirationOption, setExpirationOption] = useState<ExpirationOption>('1h');
  const [customDateTime, setCustomDateTime] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: PresetStatusConfig) => {
    setSelectedPreset(preset);
    setEmoji(preset.emoji);
    if (!statusMessage || PRESET_STATUSES.some((p) => p.label === statusMessage)) {
      setStatusMessage(preset.label);
    }
  };

  const handleSelectHistoryItem = (item: { emoji?: string | null; statusMessage?: string | null }) => {
    if (item.emoji) setEmoji(item.emoji);
    if (item.statusMessage) setStatusMessage(item.statusMessage);
    const matched = PRESET_STATUSES.find((p) => p.emoji === item.emoji || p.label === item.statusMessage);
    if (matched) setSelectedPreset(matched);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (statusMessage.length > 80) return;

    setIsSubmitting(true);
    try {
      const expiresAt = calculateExpiresAt(expirationOption, customDateTime);
      await onSelectStatus({
        statusType: selectedPreset ? selectedPreset.type : 'custom',
        mood: emoji,
        statusMessage: statusMessage.trim(),
        expiresAt,
      });
      onClose();
    } catch (err) {
      console.error('[StatusPicker] Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className={cn(
          'w-full max-w-lg bg-card text-card-foreground border border-border shadow-2xl rounded-t-3xl sm:rounded-3xl flex flex-col max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-6 duration-300'
        )}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <Sparkles className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-bold">Set Your Status</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close status picker"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 overflow-y-auto">
          {/* Live Preview Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-500/5 via-muted/30 to-muted/20 border border-border/60 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Live Preview</span>
            <div className="flex items-center gap-3">
              <StatusChip
                emoji={emoji}
                text={statusMessage || 'Enter status...'}
                statusType={selectedPreset?.type}
                size="lg"
              />
            </div>
          </div>

          {/* Preset Category Tabs */}
          <div className="flex rounded-xl bg-muted p-1 gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('common')}
              className={cn(
                'flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all',
                activeTab === 'common' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Presets
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('recent')}
              className={cn(
                'flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all',
                activeTab === 'recent' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Recent ({history.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('custom')}
              className={cn(
                'flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all',
                activeTab === 'custom' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Custom
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'common' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
              {PRESET_STATUSES.map((preset) => {
                const isSelected = selectedPreset?.type === preset.type;
                return (
                  <button
                    key={preset.type}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={cn(
                      'flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs transition-all duration-200 hover:scale-[1.02]',
                      isSelected
                        ? 'border-rose-500 bg-rose-500/10 font-bold shadow-sm'
                        : 'border-border/60 hover:bg-muted/50'
                    )}
                  >
                    <span className="text-lg leading-none">{preset.emoji}</span>
                    <span className="truncate">{preset.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {activeTab === 'recent' && (
            <div className="space-y-2 max-h-48 overflow-y-auto p-1">
              {history.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No status history yet</p>
              ) : (
                history.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectHistoryItem(item)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-border/50 hover:bg-muted/50 text-left text-xs transition-colors"
                  >
                    <span className="text-lg">{item.emoji || '💬'}</span>
                    <span className="truncate flex-1 font-medium">{item.statusMessage}</span>
                  </button>
                ))
              )}
            </div>
          )}

          {/* Status Text Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-muted-foreground uppercase tracking-wider">
                Status Message
              </label>
              <span className={cn('text-[11px]', statusMessage.length > 80 ? 'text-rose-500 font-bold' : 'text-muted-foreground')}>
                {statusMessage.length}/80
              </span>
            </div>
            <Input
              type="text"
              placeholder="What are you doing?"
              value={statusMessage}
              onChange={(e) => setStatusMessage(e.target.value.slice(0, 80))}
              maxLength={80}
              className="h-10 text-sm"
              required
            />
          </div>

          {/* Emoji Picker */}
          <EmojiPicker value={emoji} onChange={(em) => setEmoji(em)} />

          {/* Expiration Selector */}
          <ExpirationSelector
            value={expirationOption}
            customDateTime={customDateTime}
            onChange={(opt, customIso) => {
              setExpirationOption(opt);
              if (customIso) setCustomDateTime(customIso);
            }}
          />

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/60">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !statusMessage.trim() || statusMessage.length > 80}
              className="bg-rose-600 hover:bg-rose-700 text-white gap-2 px-6"
            >
              <Check className="h-4 w-4" />
              <span>{isSubmitting ? 'Saving...' : 'Set Status'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
