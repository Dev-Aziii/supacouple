import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCouple } from '../hooks/useCouple';
import {
  useMemories,
  useAlbums,
  useMilestones,
  useRelationshipTimeline,
  useMemoryMutations,
  useComments,
  useReactions,
} from '../hooks/useMemories';
import { useRealtimeMemories } from '../hooks/useRealtimeMemories';
import { MemoryTimeline } from '../components/memories/MemoryTimeline';
import { MilestoneTimeline } from '../components/memories/MilestoneTimeline';
import { AlbumGrid } from '../components/memories/AlbumGrid';
import { MemoryMap } from '../components/memories/MemoryMap';
import { MemoryGallery } from '../components/memories/MemoryGallery';
import { MemoryDialog } from '../components/memories/MemoryDialog';
import { MemoryForm } from '../components/memories/MemoryForm';
import { Clock, FolderHeart, Heart, Trophy, MapPin, Plus } from 'lucide-react';
import type { MemoryItem, TimelineItem, CreateMemoryDTO } from '../types/memory';

type TimelineTab = 'timeline' | 'albums' | 'favorites' | 'milestones' | 'map';

export const TimelinePage: React.FC = () => {
  const { user } = useAuth();
  const { couple, partner } = useCouple();
  const coupleId = couple?.id;
  const partnerId = partner?.id;

  // Realtime subscription
  useRealtimeMemories(coupleId);

  // Queries & Mutations
  const { data: memories = [] } = useMemories(coupleId);
  const { data: albums = [] } = useAlbums(coupleId);
  const { data: milestones = [] } = useMilestones(coupleId);
  const { data: timelineItems = [] } = useRelationshipTimeline(coupleId);

  const {
    createMemory,
    deleteMemory,
    toggleFavorite,
    createAlbum,
    deleteAlbum,
    createMilestone,
    deleteMilestone,
    addComment,
    deleteComment,
    react,
    removeReaction,
  } = useMemoryMutations(coupleId, partnerId);

  // Active Tab
  const [activeTab, setActiveTab] = useState<TimelineTab>('timeline');

  // Modals
  const [activeMemory, setActiveMemory] = useState<MemoryItem | null>(null);
  const [showMemoryForm, setShowMemoryForm] = useState(false);

  // Active memory details queries
  const { data: comments = [] } = useComments(activeMemory?.id);
  const { data: reactions = [] } = useReactions(activeMemory?.id);

  const tabs: { id: TimelineTab; label: string; icon: React.ReactNode }[] = [
    { id: 'timeline', label: 'Timeline', icon: <Clock className="w-4 h-4" /> },
    { id: 'milestones', label: 'Milestones', icon: <Trophy className="w-4 h-4" /> },
    { id: 'albums', label: 'Albums', icon: <FolderHeart className="w-4 h-4" /> },
    { id: 'favorites', label: 'Favorites', icon: <Heart className="w-4 h-4" /> },
    { id: 'map', label: 'Map Pin View', icon: <MapPin className="w-4 h-4" /> },
  ];

  const handleTimelineSelect = (item: TimelineItem) => {
    if (item.type === 'memory') {
      setActiveMemory(item.rawItem as MemoryItem);
    }
  };

  const favoriteMemories = memories.filter((m) => m.isFavorite);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <Clock className="w-8 h-8 text-rose-500" />
            Relationship Timeline
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Your shared journey: memories, milestones, trips, plans, and special dates chronologically.
          </p>
        </div>

        <button
          onClick={() => setShowMemoryForm(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-xs shadow-lg shadow-rose-500/25 hover:opacity-95"
        >
          <Plus className="w-4 h-4" />
          Add Memory
        </button>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex-shrink-0 ${
              activeTab === tab.id
                ? 'bg-rose-500 text-white shadow-md'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div>
        {activeTab === 'timeline' && (
          <MemoryTimeline items={timelineItems} onSelectItem={handleTimelineSelect} />
        )}

        {activeTab === 'milestones' && (
          <MilestoneTimeline
            coupleId={coupleId!}
            createdBy={user!.id}
            milestones={milestones}
            onCreateMilestone={async (dto) => {
              await createMilestone(dto);
            }}
            onDeleteMilestone={async (id) => {
              await deleteMilestone(id);
            }}
          />
        )}

        {activeTab === 'albums' && (
          <AlbumGrid
            albums={albums}
            memories={memories}
            onSelectAlbum={() => {}}
            onCreateAlbum={async (title, description) => {
              await createAlbum({ coupleId: coupleId!, createdBy: user!.id, title, description });
            }}
            onDeleteAlbum={async (id) => {
              await deleteAlbum(id);
            }}
          />
        )}

        {activeTab === 'favorites' && (
          <MemoryGallery
            memories={favoriteMemories}
            onSelectMemory={setActiveMemory}
            onToggleFavorite={(id, isFav) => toggleFavorite({ id, isFavorite: isFav })}
            onAddMemory={() => setShowMemoryForm(true)}
          />
        )}

        {activeTab === 'map' && (
          <MemoryMap memories={memories} onSelectMemory={setActiveMemory} />
        )}
      </div>

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
          onDeleteMemory={(id) => deleteMemory(id)}
        />
      )}

      {/* Memory Form Modal */}
      {showMemoryForm && (
        <MemoryForm
          coupleId={coupleId!}
          createdBy={user!.id}
          albums={albums}
          onSubmit={async (dto: CreateMemoryDTO) => {
            await createMemory(dto);
          }}
          onClose={() => setShowMemoryForm(false)}
        />
      )}
    </div>
  );
};
