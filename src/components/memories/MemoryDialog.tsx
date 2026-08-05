import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MapPin,
  Calendar,
  CloudSun,
  Tag,
  Trash2,
  Edit,
  FolderHeart,
  Lock,
  Globe,
} from 'lucide-react';
import { MemoryCarousel } from './MemoryCarousel';
import { FavoriteBadge } from './FavoriteBadge';
import { MemoryReactions } from './MemoryReactions';
import { MemoryComments } from './MemoryComments';
import type { MemoryItem, MemoryComment, MemoryReaction, MemoryAlbum } from '../../types/memory';

interface MemoryDialogProps {
  memory: MemoryItem | null;
  album?: MemoryAlbum | null;
  comments: MemoryComment[];
  reactions: MemoryReaction[];
  currentUserId?: string;
  onClose: () => void;
  onToggleFavorite?: (id: string, isFav: boolean) => void;
  onAddComment: (content: string, parentCommentId?: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  onReact: (emoji: string) => void;
  onRemoveReaction: () => void;
  onEditMemory?: (memory: MemoryItem) => void;
  onDeleteMemory?: (id: string) => void;
}

export const MemoryDialog: React.FC<MemoryDialogProps> = ({
  memory,
  album,
  comments,
  reactions,
  currentUserId,
  onClose,
  onToggleFavorite,
  onAddComment,
  onDeleteComment,
  onReact,
  onRemoveReaction,
  onEditMemory,
  onDeleteMemory,
}) => {
  if (!memory) return null;

  const images = memory.mediaUrls.length > 0 ? memory.mediaUrls : memory.coverImage ? [memory.coverImage] : [];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row max-h-[90vh]"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/40 text-white/80 hover:text-white hover:bg-black/60 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left Column: Carousel & Media */}
          <div className="w-full md:w-1/2 bg-black/5 dark:bg-black/40 p-4 flex flex-col justify-center items-center relative min-h-[300px]">
            <MemoryCarousel images={images} title={memory.title} className="w-full h-72 md:h-[450px]" />
          </div>

          {/* Right Column: Details, Comments, Reactions */}
          <div className="w-full md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto space-y-6">
            {/* Header info */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-rose-500">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(memory.eventDate).toLocaleDateString(undefined, {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <FavoriteBadge
                    isFavorite={memory.isFavorite}
                    onToggle={
                      onToggleFavorite
                        ? () => onToggleFavorite(memory.id, memory.isFavorite)
                        : undefined
                    }
                  />

                  {onEditMemory && (
                    <button
                      onClick={() => onEditMemory(memory)}
                      className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                      title="Edit Memory"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}

                  {onDeleteMemory && (
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this memory?')) {
                          onDeleteMemory(memory.id);
                          onClose();
                        }
                      }}
                      className="p-2 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500"
                      title="Delete Memory"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                {memory.title}
              </h2>

              {album && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                  <FolderHeart className="w-3.5 h-3.5" />
                  <span>Album: {album.title}</span>
                </div>
              )}

              {(memory.caption || memory.description) && (
                <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                  {memory.caption || memory.description}
                </p>
              )}

              {/* Location & Weather Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-slate-500">
                {memory.location && (
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>{memory.location}</span>
                  </div>
                )}

                {memory.weather && (
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                    <CloudSun className="w-3.5 h-3.5 text-amber-400" />
                    <span>{memory.weather}</span>
                  </div>
                )}

                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400">
                  {memory.isPrivate ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                  <span className="capitalize">{memory.visibility}</span>
                </div>
              </div>

              {/* Tags */}
              {memory.tags && memory.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {memory.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-500"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Reactions */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <MemoryReactions
                reactions={reactions}
                currentUserId={currentUserId}
                onReact={onReact}
                onRemove={onRemoveReaction}
              />
            </div>

            {/* Comments Thread */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <MemoryComments
                comments={comments}
                currentUserId={currentUserId}
                onAddComment={onAddComment}
                onDeleteComment={onDeleteComment}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
