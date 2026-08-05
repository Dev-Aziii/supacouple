import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, CloudSun, Calendar, Images } from 'lucide-react';
import { FavoriteBadge } from './FavoriteBadge';
import type { MemoryItem } from '../../types/memory';

interface MemoryCardProps {
  memory: MemoryItem;
  onSelect: (memory: MemoryItem) => void;
  onToggleFavorite?: (id: string, isFav: boolean) => void;
  layout?: 'grid' | 'masonry' | 'compact';
}

export const MemoryCard: React.FC<MemoryCardProps> = ({
  memory,
  onSelect,
  onToggleFavorite,
  layout = 'grid',
}) => {
  const image = memory.coverImage || memory.mediaUrls[0] || '/placeholder-memory.jpg';
  const photoCount = memory.mediaUrls.length;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      onClick={() => onSelect(memory)}
      className="group relative cursor-pointer overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/60 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
    >
      {/* Media Image Container */}
      <div className={`relative w-full overflow-hidden bg-slate-100 dark:bg-slate-800 ${
        layout === 'compact' ? 'h-40' : 'h-52'
      }`}>
        <img
          src={image}
          alt={memory.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Favorite Badge Top Right */}
        <div className="absolute top-3 right-3 z-10">
          <FavoriteBadge
            isFavorite={memory.isFavorite}
            onToggle={
              onToggleFavorite
                ? () => onToggleFavorite(memory.id, memory.isFavorite)
                : undefined
            }
          />
        </div>

        {/* Multi-Photo Indicator Top Left */}
        {photoCount > 1 && (
          <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-white text-xs font-medium">
            <Images className="w-3.5 h-3.5" />
            <span>{photoCount}</span>
          </div>
        )}

        {/* Weather Tag */}
        {memory.weather && (
          <div className="absolute bottom-3 left-3 z-10 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-white/90 text-xs">
            <CloudSun className="w-3.5 h-3.5 text-amber-300" />
            <span>{memory.weather}</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-rose-500 dark:text-rose-400 font-semibold">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date(memory.eventDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>

          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors line-clamp-1">
            {memory.title}
          </h3>

          {(memory.caption || memory.description) && (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
              {memory.caption || memory.description}
            </p>
          )}
        </div>

        {/* Location & Tags Footer */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
          {memory.location ? (
            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 truncate max-w-[60%]">
              <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
              <span className="truncate">{memory.location}</span>
            </div>
          ) : (
            <div />
          )}

          {/* Tags */}
          {memory.tags && memory.tags.length > 0 && (
            <div className="flex items-center gap-1">
              <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-[10px] font-medium">
                #{memory.tags[0]}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
