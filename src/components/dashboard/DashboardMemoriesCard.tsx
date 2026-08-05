import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Sparkles, FolderHeart, ArrowRight, Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-foreground flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-primary" />
            <span>Shared Memories</span>
          </div>

          <button
            onClick={() => navigate(ROUTES.GALLERY)}
            className="text-xs font-medium text-primary hover:underline flex items-center gap-0.5"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* "On This Day" Banner Alert */}
        {onThisDay.length > 0 && (
          <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-primary shrink-0" />
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                  On This Day
                </span>
                <h4 className="text-xs font-semibold text-foreground">
                  {onThisDay[0].title}
                </h4>
              </div>
            </div>
            <Button
              onClick={() => navigate(ROUTES.GALLERY)}
              size="sm"
              className="h-7 text-xs px-2.5"
            >
              Relive
            </Button>
          </div>
        )}

        {/* Recent Memories Grid */}
        {recentMemories.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
            <p>No memories saved yet.</p>
            <button
              onClick={onAddMemory}
              className="mt-2 text-primary font-medium hover:underline inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Create first memory
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
                  className="group relative cursor-pointer aspect-video rounded-xl overflow-hidden bg-secondary border border-border"
                >
                  <img
                    src={img}
                    alt={mem.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2 text-white">
                    <p className="text-[11px] font-semibold truncate">{mem.title}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick stats footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
          {latestAlbum && (
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <FolderHeart className="w-3.5 h-3.5 text-primary" />
              <span>Latest Album: {latestAlbum.title}</span>
            </div>
          )}

          <button
            onClick={onAddMemory}
            className="ml-auto text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Memory
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

