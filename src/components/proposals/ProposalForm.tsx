import React, { useState } from 'react';
import { CreateProposalDTO, ProposalCategory, ProposalPriority, SpontaneousProposal } from '@/types/proposal';
import { proposalService } from '@/services/proposals/proposalService';
import { useSession } from '@/hooks/useSession';
import {
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Shirt,
  CloudSun,
  EyeOff,
  CalendarCheck,
  Upload,
  Sparkles,
  Tag,
  Image as ImageIcon,
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface ProposalFormProps {
  initialValues?: Partial<SpontaneousProposal>;
  onSubmit: (data: Omit<CreateProposalDTO, 'coupleId' | 'senderId'>) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const CATEGORY_OPTIONS: { value: ProposalCategory; label: string; icon: string }[] = [
  { value: 'date', label: 'Romantic Date', icon: '🌹' },
  { value: 'trip', label: 'Trip & Travel', icon: '✈️' },
  { value: 'dining', label: 'Dining / Food', icon: '🍽️' },
  { value: 'activity', label: 'Fun Activity', icon: '🎨' },
  { value: 'getaway', label: 'Weekend Getaway', icon: '🏖️' },
  { value: 'movie', label: 'Movie & Show', icon: '🍿' },
  { value: 'staycation', label: 'Staycation', icon: '🏨' },
  { value: 'custom', label: 'Custom Idea', icon: '✨' },
];

export const ProposalForm: React.FC<ProposalFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const { user } = useSession();
  const userId = user?.id;

  const defaultStart = initialValues?.proposedTime ? new Date(initialValues.proposedTime) : new Date(Date.now() + 86400000);
  const defaultEnd = initialValues?.endDatetime ? new Date(initialValues.endDatetime) : new Date(defaultStart.getTime() + 7200000);

  const [title, setTitle] = useState(initialValues?.title || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [date, setDate] = useState(defaultStart.toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState(defaultStart.toTimeString().slice(0, 5));
  const [endTime, setEndTime] = useState(defaultEnd.toTimeString().slice(0, 5));
  const [location, setLocation] = useState(initialValues?.location || '');
  const [category, setCategory] = useState<ProposalCategory>(initialValues?.category || 'date');
  const [priority] = useState<ProposalPriority>(initialValues?.priority || 'medium');
  const [estimatedCost, setEstimatedCost] = useState<string>(initialValues?.estimatedCost ? String(initialValues.estimatedCost) : '');
  const [dressCode, setDressCode] = useState(initialValues?.dressCode || '');
  const [weatherRequired, setWeatherRequired] = useState(initialValues?.weatherRequired || '');
  const [isSurprise, setIsSurprise] = useState(initialValues?.isSurprise ?? false);
  const [autoAddToCalendar, setAutoAddToCalendar] = useState(initialValues?.autoAddToCalendar ?? true);
  const [reminderMinutes] = useState<number>(initialValues?.reminderMinutes || 60);

  const [coverImage, setCoverImage] = useState<string>(initialValues?.coverImage || '');
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    setIsUploading(true);
    try {
      const url = await proposalService.uploadProposalImage(file, userId);
      setCoverImage(url);
    } catch (err) {
      console.error('[ProposalForm] Image upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date || !startTime) return;

    const startIso = new Date(`${date}T${startTime}:00`).toISOString();
    const endIso = endTime ? new Date(`${date}T${endTime}:00`).toISOString() : undefined;

    await onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      location: location.trim() || undefined,
      coverImage: coverImage || undefined,
      proposedTime: startIso,
      endDatetime: endIso,
      category,
      priority,
      estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined,
      dressCode: dressCode.trim() || undefined,
      weatherRequired: weatherRequired.trim() || undefined,
      isSurprise,
      autoAddToCalendar,
      reminderMinutes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Cover Image Header */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-pink-400" /> Cover Image
          </span>
          {coverImage && (
            <button
              type="button"
              onClick={() => setCoverImage('')}
              className="text-rose-400 text-[11px] hover:underline"
            >
              Remove
            </button>
          )}
        </label>

        {coverImage ? (
          <div className="relative h-44 rounded-2xl overflow-hidden border border-border/50">
            <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover" />
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center h-32 rounded-2xl border-2 border-dashed border-border/60 bg-accent/20 hover:bg-accent/40 cursor-pointer transition-colors">
            <Upload className="w-6 h-6 text-pink-400 mb-1" />
            <span className="text-xs font-medium text-foreground">
              {isUploading ? 'Uploading Image...' : 'Upload Proposal Banner Image'}
            </span>
            <span className="text-[10px] text-muted-foreground">PNG, JPG or WEBP (Max 5MB)</span>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
        )}
      </div>

      {/* Title & Category */}
      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">
            Proposal Title <span className="text-pink-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. Candlelight Dinner at Sunset Beach"
            className="w-full bg-accent/40 border border-border/60 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50"
          />
        </div>

        {/* Category Pills */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-pink-400" /> Category
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map((cat) => (
              <button
                type="button"
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5',
                  category === cat.value
                    ? 'bg-pink-500/20 text-pink-300 border-pink-500/50 shadow-sm'
                    : 'bg-accent/30 text-muted-foreground border-border/40 hover:bg-accent hover:text-foreground'
                )}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Date, Start Time, End Time */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-pink-400" /> Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full bg-accent/40 border border-border/50 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-pink-500/50"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-pink-400" /> Start Time
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            className="w-full bg-accent/40 border border-border/50 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-pink-500/50"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-pink-400" /> End Time (Optional)
          </label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full bg-accent/40 border border-border/50 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-pink-500/50"
          />
        </div>
      </div>

      {/* Location & Estimated Cost */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-pink-400" /> Location / Google Maps Link
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Marina Bay Bistro, Singapore"
            className="w-full bg-accent/40 border border-border/50 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-pink-500/50"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-pink-400" /> Estimated Cost ($)
          </label>
          <input
            type="number"
            value={estimatedCost}
            onChange={(e) => setEstimatedCost(e.target.value)}
            placeholder="e.g. 150"
            className="w-full bg-accent/40 border border-border/50 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-pink-500/50"
          />
        </div>
      </div>

      {/* Dress Code & Weather Required */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Shirt className="w-3.5 h-3.5 text-pink-400" /> Dress Code
          </label>
          <input
            type="text"
            value={dressCode}
            onChange={(e) => setDressCode(e.target.value)}
            placeholder="e.g. Smart Casual / Evening Gown"
            className="w-full bg-accent/40 border border-border/50 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-pink-500/50"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <CloudSun className="w-3.5 h-3.5 text-pink-400" /> Weather Needed
          </label>
          <input
            type="text"
            value={weatherRequired}
            onChange={(e) => setWeatherRequired(e.target.value)}
            placeholder="e.g. Sunny / Clear Skies"
            className="w-full bg-accent/40 border border-border/50 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-pink-500/50"
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Description & Highlights</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Share your thoughts, plan details, or why this date will be special..."
          className="w-full bg-accent/40 border border-border/50 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-pink-500/50"
        />
      </div>

      {/* Switches & Toggles */}
      <div className="p-4 rounded-2xl bg-accent/30 border border-border/40 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-purple-400" />
            <div>
              <p className="text-xs font-semibold text-foreground">Surprise Proposal</p>
              <p className="text-[10px] text-muted-foreground">Hide full details until partner accepts</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={isSurprise}
            onChange={(e) => setIsSurprise(e.target.checked)}
            className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between border-t border-border/30 pt-3">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-emerald-400" />
            <div>
              <p className="text-xs font-semibold text-foreground">Auto Add to Shared Calendar</p>
              <p className="text-[10px] text-muted-foreground">Creates a plan automatically when accepted</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={autoAddToCalendar}
            onChange={(e) => setAutoAddToCalendar(e.target.checked)}
            className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!title.trim() || isSubmitting || isUploading}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold text-xs hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 transition-all shadow-lg shadow-pink-500/25 flex items-center gap-1.5"
        >
          <Sparkles className="w-4 h-4" />
          <span>{initialValues ? 'Save Proposal' : 'Send Proposal'}</span>
        </button>
      </div>
    </form>
  );
};
