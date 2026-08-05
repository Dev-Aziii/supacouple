import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Sparkles, FolderHeart, ArrowRight } from 'lucide-react';
import { useMemories, useOnThisDayMemories, useAlbums } from '@/hooks/useMemories';
import { ROUTES } from '@/constants/routes';

interface DashboardMemoriesCardProps {
  coupleId?: string;
  onAddMemory: () => void;
}

export const DashboardMemoriesCard: React.FC<DashboardMemoriesCardProps> = ({
  coupleId,
  onAddMemory,
}) => {
  const navigate = useNavigate();
  const { data: memories = [] } = useMemories(coupleId);
  const { data: onThisDay = [] } = useOnThisDayMemories(coupleId);
  const { data: albums = [] } = useAlbums(coupleId);

  const recentMemories = memories.slice(0, 4);
  const latestAlbum = albums[0];

  return (
    <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/60 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Shared Memories
            </h3>
            <p className="text-xs text-slate-400">Your journal & photo vault</p>
          </div>
        </div>

        <button
          onClick={() => navigate(ROUTES.GALLERY)}
          className="text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1"
        >
          View All <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* "On This Day" Banner Alert if present */}
      {onThisDay.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-amber-500/10 border border-rose-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-500">
                On This Day Memory ✨
              </span>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {onThisDay[0].title}
              </h4>
            </div>
          </div>
          <button
            onClick={() => navigate(ROUTES.GALLERY)}
            className="px-3 py-1 bg-rose-500 text-white rounded-xl text-xs font-bold shadow-sm"
          >
            Relive
          </button>
        </div>
      )}

      {/* Recent Memories Carousel / Grid */}
      {recentMemories.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          <p>No memories saved yet.</p>
          <button
            onClick={onAddMemory}
            className="mt-2 text-rose-500 font-semibold underline"
          >
            Create first memory
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {recentMemories.map((mem) => {
            const img = mem.coverImage || mem.mediaUrls[0] || '/placeholder.jpg';
            return (
              <div
                key={mem.id}
                onClick={() => navigate(ROUTES.GALLERY)}
                className="group relative cursor-pointer aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/40 dark:border-slate-800"
              >
                <img
                  src={img}
                  alt={mem.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-2 left-2 right-2 text-white">
                  <p className="text-[11px] font-bold truncate">{mem.title}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick stats footer */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
        {latestAlbum && (
          <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold">
            <FolderHeart className="w-4 h-4" />
            <span>Latest Album: {latestAlbum.title}</span>
          </div>
        )}

        <button
          onClick={onAddMemory}
          className="ml-auto text-xs font-bold text-rose-500 hover:underline"
        >
          + Add Memory
        </button>
      </div>
    </div>
  );
};
