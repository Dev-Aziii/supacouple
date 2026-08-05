import React from 'react';
import { Camera, Plus } from 'lucide-react';

interface EmptyGalleryProps {
  onAddMemory: () => void;
}

export const EmptyGallery: React.FC<EmptyGalleryProps> = ({ onAddMemory }) => {
  return (
    <div className="py-16 px-4 text-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-4 max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-rose-500/20">
        <Camera className="w-8 h-8" />
      </div>

      <div className="space-y-1">
        <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
          No Memories Found
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
          Start capturing your love story! Upload photos, tag locations, and preserve your special moments together.
        </p>
      </div>

      <button
        onClick={onAddMemory}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white text-xs font-bold shadow-lg shadow-rose-500/30 hover:opacity-95 transition-opacity"
      >
        <Plus className="w-4 h-4" />
        Add Your First Memory
      </button>
    </div>
  );
};
