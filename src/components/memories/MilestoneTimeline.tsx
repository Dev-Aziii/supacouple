import React, { useState } from 'react';
import { Plus, Sparkles, Trophy } from 'lucide-react';
import { MilestoneCard } from './MilestoneCard';
import type { RelationshipMilestone, MilestoneType, CreateMilestoneDTO } from '../../types/memory';

interface MilestoneTimelineProps {
  coupleId: string;
  createdBy: string;
  milestones: RelationshipMilestone[];
  onCreateMilestone: (dto: CreateMilestoneDTO) => Promise<void>;
  onDeleteMilestone: (id: string) => Promise<void>;
}

const MILESTONE_TYPES: MilestoneType[] = [
  'First Date',
  'First Trip',
  'Anniversary',
  'Moved In',
  'Proposal',
  'Wedding',
  'Vacation',
  'Custom',
];

export const MilestoneTimeline: React.FC<MilestoneTimelineProps> = ({
  coupleId,
  createdBy,
  milestones,
  onCreateMilestone,
  onDeleteMilestone,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<MilestoneType>('First Date');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onCreateMilestone({
        coupleId,
        createdBy,
        title: title.trim(),
        description: description.trim() || undefined,
        type,
        date,
      });
      setTitle('');
      setDescription('');
      setShowModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-rose-500" />
            Relationship Milestones ({milestones.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Celebrate big chapters and special moments in your journey together
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md hover:opacity-95"
        >
          <Plus className="w-4 h-4" />
          Add Milestone
        </button>
      </div>

      {milestones.length === 0 ? (
        <div className="py-12 text-center bg-slate-50 dark:bg-slate-800/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <Sparkles className="w-12 h-12 text-rose-300 dark:text-rose-900 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No Milestones Yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Add your First Date, Anniversary, Moving In together, or Proposal to start your milestone timeline!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {milestones.map((ms) => (
            <MilestoneCard key={ms.id} milestone={ms} onDelete={onDeleteMilestone} />
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Add Milestone</h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Milestone Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as MilestoneType)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 focus:ring-2 focus:ring-rose-500/50 outline-none"
                >
                  {MILESTONE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Our First Date at Ocean Beach"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 focus:ring-2 focus:ring-rose-500/50 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 focus:ring-2 focus:ring-rose-500/50 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details or feelings about this special day..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 focus:ring-2 focus:ring-rose-500/50 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!title.trim() || isSubmitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-xl disabled:opacity-50"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
