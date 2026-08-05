import React, { useState } from 'react';
import { MapPin, Navigation, Compass } from 'lucide-react';
import { MemoryCard } from './MemoryCard';
import type { MemoryItem } from '../../types/memory';

interface MemoryMapProps {
  memories: MemoryItem[];
  onSelectMemory: (memory: MemoryItem) => void;
}

export const MemoryMap: React.FC<MemoryMapProps> = ({ memories, onSelectMemory }) => {
  const [selectedLoc, setSelectedLoc] = useState<string | null>(null);

  // Group memories by location string
  const locationGroups: Record<string, MemoryItem[]> = {};

  memories.forEach((mem) => {
    const loc = mem.location?.trim() || 'Unspecified Location';
    if (!locationGroups[loc]) {
      locationGroups[loc] = [];
    }
    locationGroups[loc].push(mem);
  });

  const locationsList = Object.keys(locationGroups);
  const activeMemories = selectedLoc ? locationGroups[selectedLoc] || [] : memories;

  return (
    <div className="space-y-6">
      {/* Visual Interactive Location Pins Banner */}
      <div className="relative w-full h-64 sm:h-80 rounded-3xl overflow-hidden bg-gradient-to-tr from-slate-900 via-rose-950 to-slate-900 text-white p-6 shadow-2xl flex flex-col justify-between border border-rose-900/40">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#f43f5e_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-2xl bg-rose-500/20 backdrop-blur-md border border-rose-500/30 text-rose-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">Relationship Map</h2>
              <p className="text-xs text-rose-200/80">Explore memories pin by pin around the globe</p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold border border-white/10">
            <MapPin className="w-4 h-4 text-rose-400" />
            <span>{locationsList.length} locations</span>
          </div>
        </div>

        {/* Location Pins Row */}
        <div className="relative z-10 flex items-center gap-2 overflow-x-auto py-2 pr-2">
          <button
            onClick={() => setSelectedLoc(null)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedLoc === null
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                : 'bg-white/10 hover:bg-white/20 text-white/80'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            All Pins ({memories.length})
          </button>

          {locationsList.map((loc) => (
            <button
              key={loc}
              onClick={() => setSelectedLoc(loc)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                selectedLoc === loc
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                  : 'bg-white/10 hover:bg-white/20 text-white/80'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>{loc}</span>
              <span className="px-1.5 py-0.5 rounded-full bg-black/30 text-[10px]">
                {locationGroups[loc].length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid of memories for selected location pin */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-rose-500" />
          {selectedLoc ? `Memories in "${selectedLoc}"` : 'All Geotagged Memories'} ({activeMemories.length})
        </h3>

        {activeMemories.length === 0 ? (
          <p className="text-xs text-slate-400 py-8 text-center italic">No memories found for this location.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {activeMemories.map((mem) => (
              <MemoryCard key={mem.id} memory={mem} onSelect={onSelectMemory} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
