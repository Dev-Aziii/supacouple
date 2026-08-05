import React from 'react';
import { MemoryCard } from './MemoryCard';
import { EmptyGallery } from './EmptyGallery';
import type { MemoryItem } from '../../types/memory';

interface MemoryGalleryProps {
  memories: MemoryItem[];
  layout?: 'grid' | 'masonry';
  onSelectMemory: (memory: MemoryItem) => void;
  onToggleFavorite?: (id: string, isFav: boolean) => void;
  onAddMemory: () => void;
}

export const MemoryGallery: React.FC<MemoryGalleryProps> = ({
  memories,
  layout = 'grid',
  onSelectMemory,
  onToggleFavorite,
  onAddMemory,
}) => {
  if (memories.length === 0) {
    return <EmptyGallery onAddMemory={onAddMemory} />;
  }

  if (layout === 'masonry') {
    return (
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
        {memories.map((mem) => (
          <div key={mem.id} className="break-inside-avoid">
            <MemoryCard
              memory={mem}
              layout="masonry"
              onSelect={onSelectMemory}
              onToggleFavorite={onToggleFavorite}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {memories.map((mem) => (
        <MemoryCard
          key={mem.id}
          memory={mem}
          layout="grid"
          onSelect={onSelectMemory}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
};
