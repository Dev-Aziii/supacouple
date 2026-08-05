import React, { useState } from 'react';
import { ExpirationOption } from '@/types/status';
import { cn } from '@/utils/cn';
import { Input } from '@/components/ui/input';
import { Clock, Calendar } from 'lucide-react';

interface ExpirationSelectorProps {
  value: ExpirationOption;
  customDateTime?: string;
  onChange: (option: ExpirationOption, customDateIso?: string) => void;
  className?: string;
}

const OPTIONS: { option: ExpirationOption; label: string }[] = [
  { option: '30m', label: '30 min' },
  { option: '1h', label: '1 hour' },
  { option: '2h', label: '2 hours' },
  { option: '4h', label: '4 hours' },
  { option: 'until_changed', label: 'Until Changed' },
  { option: 'custom', label: 'Custom Date' },
];


export const ExpirationSelector: React.FC<ExpirationSelectorProps> = ({
  value,
  customDateTime = '',
  onChange,
  className,
}) => {
  const [customInput, setCustomInput] = useState(customDateTime);

  const handleSelectOption = (option: ExpirationOption) => {
    if (option === 'custom') {
      const defaultCustom = customInput || new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 16);
      setCustomInput(defaultCustom);
      onChange('custom', defaultCustom);
    } else {
      onChange(option, undefined);
    }
  };

  const handleCustomDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomInput(val);
    if (val) {
      onChange('custom', val);
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
        <Clock className="h-3.5 w-3.5 text-rose-500" />
        <span>Status Expiration</span>
      </label>

      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map(({ option, label }) => {
          const isSelected = value === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => handleSelectOption(option)}
              className={cn(
                'py-2 px-3 text-xs font-medium rounded-xl border transition-all duration-200 text-center',
                isSelected
                  ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20 font-bold scale-[1.02]'
                  : 'bg-muted/30 border-border text-foreground hover:bg-rose-500/10 hover:border-rose-500/30'
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      {value === 'custom' && (
        <div className="flex items-center gap-2 pt-1 animate-in fade-in duration-200">
          <Calendar className="h-4 w-4 text-rose-500 shrink-0" />
          <Input
            type="datetime-local"
            value={customInput}
            onChange={handleCustomDateChange}
            className="text-xs h-9"
          />
        </div>
      )}
    </div>
  );
};
