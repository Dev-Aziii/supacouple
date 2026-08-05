import React from 'react';
import { Search, Grid, LayoutGrid, Clock, FolderHeart, Heart, MapPin, Tag } from 'lucide-react';

export type GalleryViewMode = 'grid' | 'masonry' | 'timeline' | 'album' | 'favorites' | 'map';

interface MemoryFiltersProps {
  viewMode: GalleryViewMode;
  onViewChange: (mode: GalleryViewMode) => void;
  search: string;
  onSearchChange: (query: string) => void;
  selectedTag: string;
  onTagChange: (tag: string) => void;
  availableTags: string[];
  sortOrder: 'newest' | 'oldest';
  onSortChange: (sort: 'newest' | 'oldest') => void;
}

export const MemoryFilters: React.FC<MemoryFiltersProps> = ({
  viewMode,
  onViewChange,
  search,
  onSearchChange,
  selectedTag,
  onTagChange,
  availableTags,
  sortOrder,
  onSortChange,
}) => {
  const views: { mode: GalleryViewMode; label: string; icon: React.ReactNode }[] = [
    { mode: 'grid', label: 'Grid', icon: <Grid className="w-4 h-4" /> },
    { mode: 'masonry', label: 'Masonry', icon: <LayoutGrid className="w-4 h-4" /> },
    { mode: 'timeline', label: 'Timeline', icon: <Clock className="w-4 h-4" /> },
    { mode: 'album', label: 'Albums', icon: <FolderHeart className="w-4 h-4" /> },
    { mode: 'favorites', label: 'Favorites', icon: <Heart className="w-4 h-4" /> },
    { mode: 'map', label: 'Map', icon: <MapPin className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-4 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
      {/* Top row: Search & View Modes */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search memories by title, location, or story..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50"
          />
        </div>

        {/* View Mode Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
          {views.map((v) => (
            <button
              key={v.mode}
              onClick={() => onViewChange(v.mode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                viewMode === v.mode
                  ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {v.icon}
              <span className="hidden md:inline">{v.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom row: Tag Filters & Sort */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
        {/* Tags */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <button
            onClick={() => onTagChange('')}
            className={`px-3 py-1 rounded-full font-medium transition-all ${
              selectedTag === ''
                ? 'bg-rose-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            All Tags
          </button>
          {availableTags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagChange(tag)}
              className={`px-3 py-1 rounded-full font-medium transition-all flex items-center gap-1 ${
                selectedTag === tag
                  ? 'bg-rose-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Tag className="w-3 h-3" />
              <span>#{tag}</span>
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 font-medium text-slate-500">
          <span>Sort:</span>
          <select
            value={sortOrder}
            onChange={(e) => onSortChange(e.target.value as 'newest' | 'oldest')}
            className="px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>
    </div>
  );
};
