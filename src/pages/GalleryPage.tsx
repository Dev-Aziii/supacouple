import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCouple } from '../hooks/useCouple';
import {
  useMemories,
  useAlbums,
  useRelationshipTimeline,
  useMemoryMutations,
  useComments,
  useReactions,
} from '../hooks/useMemories';
import { useRealtimeMemories } from '../hooks/useRealtimeMemories';
import { MemoryFilters, GalleryViewMode } from '../components/memories/MemoryFilters';
import { MemoryGallery } from '../components/memories/MemoryGallery';
import { MemoryTimeline } from '../components/memories/MemoryTimeline';
import { AlbumGrid } from '../components/memories/AlbumGrid';
import { MemoryMap } from '../components/memories/MemoryMap';
import { MemoryDialog } from '../components/memories/MemoryDialog';
import { MemoryForm } from '../components/memories/MemoryForm';
import { Plus, Camera } from 'lucide-react';
import type { MemoryItem, MemoryAlbum, CreateMemoryDTO, TimelineItem } from '../types/memory';

export const GalleryPage: React.FC = () => {
  const { user } = useAuth();
  const { couple, partner } = useCouple();
  const coupleId = couple?.id;
  const partnerId = partner?.id;

  // Realtime subscription
  useRealtimeMemories(coupleId);

  // Queries & Mutations
  const { data: memories = [], isLoading } = useMemories(coupleId);
  const { data: albums = [] } = useAlbums(coupleId);
  const { data: timelineItems = [] } = useRelationshipTimeline(coupleId);

  const {
    createMemory,
    editMemory,
    deleteMemory,
    toggleFavorite,
    createAlbum,
    deleteAlbum,
    addComment,
    deleteComment,
    react,
    removeReaction,
  } = useMemoryMutations(coupleId, partnerId);

  // Local State
  const [viewMode, setViewMode] = useState<GalleryViewMode>('grid');
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [selectedAlbum, setSelectedAlbum] = useState<MemoryAlbum | null>(null);

  // Modals & Selected items
  const [activeMemory, setActiveMemory] = useState<MemoryItem | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingMemory, setEditingMemory] = useState<MemoryItem | undefined>(undefined);

  // Detail Dialog Data
  const { data: comments = [] } = useComments(activeMemory?.id);
  const { data: reactions = [] } = useReactions(activeMemory?.id);

  // Extract unique tags across all memories
  const availableTags = Array.from(
    new Set(memories.flatMap((m) => m.tags || []))
  );

  // Filter memories
  let filteredMemories = memories.filter((m) => {
    if (selectedAlbum && m.albumId !== selectedAlbum.id) return false;
    if (viewMode === 'favorites' && !m.isFavorite) return false;
    if (selectedTag && !m.tags?.includes(selectedTag)) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const titleMatch = m.title.toLowerCase().includes(q);
      const capMatch = (m.caption || m.description || '').toLowerCase().includes(q);
      const locMatch = (m.location || '').toLowerCase().includes(q);
      if (!titleMatch && !capMatch && !locMatch) return false;
    }
    return true;
  });

  // Sort memories
  filteredMemories = filteredMemories.sort((a, b) => {
    const dA = new Date(a.eventDate).getTime();
    const dB = new Date(b.eventDate).getTime();
    return sortOrder === 'newest' ? dB - dA : dA - dB;
  });

  const handleCreateMemorySubmit = async (dto: CreateMemoryDTO) => {
    if (editingMemory) {
      await editMemory({ id: editingMemory.id, updates: dto });
    } else {
      await createMemory(dto);
    }
    setEditingMemory(undefined);
  };

  const handleTimelineSelect = (item: TimelineItem) => {
    if (item.type === 'memory') {
      setActiveMemory(item.rawItem as MemoryItem);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <Camera className="w-8 h-8 text-rose-500" />
            Memories & Photo Gallery
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Preserve your love story through photos, albums, and milestones.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingMemory(undefined);
            setShowFormModal(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-xs shadow-lg shadow-rose-500/25 hover:opacity-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add New Memory
        </button>
      </div>

      {/* Filters Bar */}
      <MemoryFilters
        viewMode={viewMode}
        onViewChange={(mode) => {
          setViewMode(mode);
          if (mode !== 'album') setSelectedAlbum(null);
        }}
        search={search}
        onSearchChange={setSearch}
        selectedTag={selectedTag}
        onTagChange={setSelectedTag}
        availableTags={availableTags}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
      />

      {/* Active Album Filter Header */}
      {selectedAlbum && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900">
          <div>
            <span className="text-xs text-rose-500 font-bold uppercase tracking-wider">
              Filtered by Album
            </span>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              {selectedAlbum.title}
            </h3>
          </div>
          <button
            onClick={() => setSelectedAlbum(null)}
            className="text-xs font-semibold text-rose-600 dark:text-rose-400 underline hover:opacity-80"
          >
            Show All Memories
          </button>
        </div>
      )}

      {/* View Mode Contents */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400 animate-pulse">Loading gallery...</div>
      ) : (
        <>
          {viewMode === 'grid' && (
            <MemoryGallery
              memories={filteredMemories}
              layout="grid"
              onSelectMemory={setActiveMemory}
              onToggleFavorite={(id, isFav) => toggleFavorite({ id, isFavorite: isFav })}
              onAddMemory={() => setShowFormModal(true)}
            />
          )}

          {viewMode === 'masonry' && (
            <MemoryGallery
              memories={filteredMemories}
              layout="masonry"
              onSelectMemory={setActiveMemory}
              onToggleFavorite={(id, isFav) => toggleFavorite({ id, isFavorite: isFav })}
              onAddMemory={() => setShowFormModal(true)}
            />
          )}

          {viewMode === 'timeline' && (
            <MemoryTimeline
              items={timelineItems}
              onSelectItem={handleTimelineSelect}
              onAddMemory={() => setShowFormModal(true)}
            />
          )}

          {viewMode === 'album' && (
            <AlbumGrid
              albums={albums}
              memories={memories}
              onSelectAlbum={(alb) => {
                setSelectedAlbum(alb);
                setViewMode('grid');
              }}
              onCreateAlbum={async (title, description) => {
                await createAlbum({ coupleId: coupleId!, createdBy: user!.id, title, description });
              }}
              onDeleteAlbum={async (id) => {
                await deleteAlbum(id);
              }}
            />
          )}

          {viewMode === 'favorites' && (
            <MemoryGallery
              memories={filteredMemories}
              layout="grid"
              onSelectMemory={setActiveMemory}
              onToggleFavorite={(id, isFav) => toggleFavorite({ id, isFavorite: isFav })}
              onAddMemory={() => setShowFormModal(true)}
            />
          )}

          {viewMode === 'map' && (
            <MemoryMap memories={memories} onSelectMemory={setActiveMemory} />
          )}
        </>
      )}

      {/* Memory Detail Modal */}
      {activeMemory && (
        <MemoryDialog
          memory={activeMemory}
          album={albums.find((a) => a.id === activeMemory.albumId)}
          comments={comments}
          reactions={reactions}
          currentUserId={user?.id}
          onClose={() => setActiveMemory(null)}
          onToggleFavorite={(id, isFav) => toggleFavorite({ id, isFavorite: isFav })}
          onAddComment={async (content, parentId) => {
            await addComment({ memoryId: activeMemory.id, userId: user!.id, content, parentCommentId: parentId });
          }}
          onDeleteComment={async (commentId) => {
            await deleteComment({ commentId, memoryId: activeMemory.id });
          }}
          onReact={(emoji) => react({ memoryId: activeMemory.id, userId: user!.id, emoji })}
          onRemoveReaction={() => removeReaction({ memoryId: activeMemory.id, userId: user!.id })}
          onEditMemory={(mem) => {
            setActiveMemory(null);
            setEditingMemory(mem);
            setShowFormModal(true);
          }}
          onDeleteMemory={(id) => deleteMemory(id)}
        />
      )}

      {/* Memory Form Modal */}
      {showFormModal && (
        <MemoryForm
          coupleId={coupleId!}
          createdBy={user!.id}
          albums={albums}
          initialData={editingMemory}
          onSubmit={handleCreateMemorySubmit}
          onClose={() => {
            setShowFormModal(false);
            setEditingMemory(undefined);
          }}
        />
      )}
    </div>
  );
};
