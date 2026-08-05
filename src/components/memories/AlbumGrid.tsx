import React, { useState } from 'react';
import { Plus, FolderHeart } from 'lucide-react';
import { AlbumCard } from './AlbumCard';
import type { MemoryAlbum, MemoryItem } from '../../types/memory';

interface AlbumGridProps {
  albums: MemoryAlbum[];
  memories: MemoryItem[];
  onSelectAlbum: (album: MemoryAlbum) => void;
  onCreateAlbum: (title: string, description?: string) => Promise<void>;
  onDeleteAlbum: (albumId: string) => Promise<void>;
}

export const AlbumGrid: React.FC<AlbumGridProps> = ({
  albums,
  memories,
  onSelectAlbum,
  onCreateAlbum,
  onDeleteAlbum,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getMemoryCount = (albumId: string) => memories.filter((m) => m.albumId === albumId).length;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onCreateAlbum(title.trim(), description.trim() || undefined);
      setTitle('');
      setDescription('');
      setShowCreateModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FolderHeart className="w-5 h-5 text-rose-500" />
            Photo Albums ({albums.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Organize your relationship memories into collections
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md hover:opacity-95 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Create Album
        </button>
      </div>

      {albums.length === 0 ? (
        <div className="py-12 text-center bg-slate-50 dark:bg-slate-800/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <FolderHeart className="w-12 h-12 text-rose-300 dark:text-rose-900 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No Albums Yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Create albums like "Summer Vacations", "Date Nights", or "Trips" to group your favorite memories.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {albums.map((album) => (
            <AlbumCard
              key={album.id}
              album={album}
              memoryCount={getMemoryCount(album.id)}
              onSelect={onSelectAlbum}
              onDelete={onDeleteAlbum}
            />
          ))}
        </div>
      )}

      {/* Create Album Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Create New Album</h3>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Album Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Hawaii Trip 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 text-sm focus:ring-2 focus:ring-rose-500/50 outline-none"
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
                  placeholder="Optional description..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 text-sm focus:ring-2 focus:ring-rose-500/50 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!title.trim() || isSubmitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-xl disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
