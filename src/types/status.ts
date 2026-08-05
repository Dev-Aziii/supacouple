export type PresetStatusType =
  | 'working'
  | 'driving'
  | 'sleeping'
  | 'studying'
  | 'busy'
  | 'available'
  | 'at_home'
  | 'outside'
  | 'shopping'
  | 'eating'
  | 'traveling'
  | 'gaming'
  | 'gym'
  | 'custom';

export type ExpirationOption = '30m' | '1h' | '2h' | '4h' | 'until_changed' | 'custom';

export interface PresetStatusConfig {
  type: PresetStatusType;
  label: string;
  emoji: string;
  category: 'common' | 'activity' | 'location';
  color: string;
}

export const PRESET_STATUSES: PresetStatusConfig[] = [
  { type: 'available', label: 'Available', emoji: '🟢', category: 'common', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400' },
  { type: 'busy', label: 'Busy', emoji: '⛔', category: 'common', color: 'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400' },
  { type: 'working', label: 'Working', emoji: '💻', category: 'common', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400' },
  { type: 'at_home', label: 'At Home', emoji: '🏠', category: 'location', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400' },
  { type: 'eating', label: 'Eating', emoji: '🍽️', category: 'common', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400' },
  { type: 'sleeping', label: 'Sleeping', emoji: '😴', category: 'common', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20 dark:text-indigo-400' },
  { type: 'gaming', label: 'Gaming', emoji: '🎮', category: 'common', color: 'bg-violet-500/10 text-violet-600 border-violet-500/20 dark:text-violet-400' },
  { type: 'driving', label: 'Driving', emoji: '🚗', category: 'activity', color: 'bg-orange-500/10 text-orange-600 border-orange-500/20 dark:text-orange-400' },
  { type: 'studying', label: 'Studying', emoji: '📚', category: 'activity', color: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20 dark:text-cyan-400' },
  { type: 'outside', label: 'Outside', emoji: '🌿', category: 'location', color: 'bg-teal-500/10 text-teal-600 border-teal-500/20 dark:text-teal-400' },
  { type: 'shopping', label: 'Shopping', emoji: '🛍️', category: 'activity', color: 'bg-pink-500/10 text-pink-600 border-pink-500/20 dark:text-pink-400' },
  { type: 'traveling', label: 'Traveling', emoji: '✈️', category: 'activity', color: 'bg-sky-500/10 text-sky-600 border-sky-500/20 dark:text-sky-400' },
  { type: 'gym', label: 'Gym', emoji: '🏋️', category: 'activity', color: 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400' },
];

export interface StatusUpdate {
  id: string;
  userId: string;
  coupleId?: string | null;
  statusType?: PresetStatusType;
  mood?: string | null;
  statusMessage?: string | null;
  customStatus?: string | null;
  expiresAt?: string | null;
  createdAt?: string;
  updatedAt: string;
}

