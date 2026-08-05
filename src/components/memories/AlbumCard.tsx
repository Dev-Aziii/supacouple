import React from 'react';
import { motion } from 'framer-motion';
import { FolderHeart, Images, Trash2 } from 'lucide-react';
import type { MemoryAlbum } from '../../types/memory';

interface AlbumCardProps {
  album: MemoryAlbum;
  memoryCount?: number;
  onSelect: (album: MemoryAlbum) => void;
  onDelete?: (albumId: string) => void;
}

export const AlbumCard: React.FC<AlbumCardProps> = ({
  album,
  memoryCount = 0,
  onSelect,
  onDelete,
}) => {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      onClick={() => onSelect(album)}
      className="group relative cursor-pointer overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/60 shadow-sm hover:shadow-xl transition-all duration-300"
    >
      {/* Cover Image */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        {album.coverImage ? (
          <img
            src={album.coverImage}
            alt={album.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-rose-300 dark:text-rose-900 bg-rose-50 dark:bg-rose-950/30">
            <FolderHeart className="w-12 h-12 mb-1" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Count Badge */}
        <div className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-white text-xs font-semibold">
          <Images className="w-3.5 h-3.5" />
          <span>{memoryCount} memories</span>
        </div>

        {/* Delete button */}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Delete album "${album.title}"?`)) {
                onDelete(album.id);
              }
            }}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 text-white/70 hover:text-rose-400 hover:bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Delete album"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        {/* Title overlay */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <h3 className="text-lg font-extrabold truncate group-hover:text-rose-300 transition-colors">
            {album.title}
          </h3>
          {album.description && (
            <p className="text-xs text-white/80 line-clamp-1">{album.description}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};
