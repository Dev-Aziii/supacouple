import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, MapPin, Calendar, CloudSun, Tag, FolderHeart, Sparkles } from 'lucide-react';
import { compressImage } from '../../utils/imageCompression';
import { memoryRepository } from '../../services/repositories/memoryRepository';
import type { MemoryItem, MemoryAlbum, CreateMemoryDTO } from '../../types/memory';

interface MemoryFormProps {
  coupleId: string;
  createdBy: string;
  albums: MemoryAlbum[];
  initialData?: MemoryItem;
  onSubmit: (dto: CreateMemoryDTO) => Promise<void>;
  onClose: () => void;
}

export const MemoryForm: React.FC<MemoryFormProps> = ({
  coupleId,
  createdBy,
  albums,
  initialData,
  onSubmit,
  onClose,
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [caption, setCaption] = useState(initialData?.caption || initialData?.description || '');
  const [eventDate, setEventDate] = useState(
    initialData?.eventDate ? initialData.eventDate.split('T')[0] : new Date().toISOString().split('T')[0]
  );
  const [location, setLocation] = useState(initialData?.location || '');
  const [weather, setWeather] = useState(initialData?.weather || 'Sunny ☀️');
  const [albumId, setAlbumId] = useState(initialData?.albumId || '');
  const [isFavorite, setIsFavorite] = useState(initialData?.isFavorite ?? false);
  const [isPrivate, setIsPrivate] = useState(initialData?.isPrivate ?? false);
  const [tagsInput, setTagsInput] = useState(initialData?.tags ? initialData.tags.join(', ') : '');

  // File uploads
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>(initialData?.mediaUrls || []);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    setSelectedFiles((prev) => [...prev, ...files]);

    setIsCompressing(true);
    try {
      const newPreviews: string[] = [];
      for (const file of files) {
        const compressed = await compressImage(file, { maxWidth: 600, maxHeight: 600, quality: 0.7 });
        const reader = new FileReader();
        reader.readAsDataURL(compressed);
        await new Promise((res) => {
          reader.onloadend = () => {
            newPreviews.push(reader.result as string);
            res(true);
          };
        });
      }
      setPreviewUrls((prev) => [...prev, ...newPreviews]);
    } finally {
      setIsCompressing(false);
    }
  };

  const removePreview = (index: number) => {
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);

      let mediaUrls = [...(initialData?.mediaUrls || [])];

      if (selectedFiles.length > 0) {
        const uploaded = await memoryRepository.uploadImages(selectedFiles, coupleId);
        mediaUrls = [...mediaUrls, ...uploaded];
      }

      const tags = tagsInput
        .split(',')
        .map((t) => t.trim().replace(/^#/, ''))
        .filter(Boolean);

      const dto: CreateMemoryDTO = {
        coupleId,
        createdBy,
        title: title.trim(),
        caption: caption.trim() || undefined,
        description: caption.trim() || undefined,
        coverImage: mediaUrls[0] || initialData?.coverImage || undefined,
        mediaUrls,
        eventDate,
        location: location.trim() || undefined,
        weather: weather || undefined,
        albumId: albumId || undefined,
        isFavorite,
        isPrivate,
        tags,
      };

      await onSubmit(dto);
      onClose();
    } catch (err) {
      console.error('Failed to submit memory:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-rose-500" />
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
              {initialData ? 'Edit Memory' : 'Create New Memory'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-sm">
          {/* Photo Uploader */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Memory Photos
            </label>

            <div className="grid grid-cols-4 gap-2">
              {previewUrls.map((url, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border">
                  <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePreview(idx)}
                    className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-rose-500 dark:hover:border-rose-400 rounded-xl aspect-square flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50 dark:bg-slate-800/40 text-slate-400 hover:text-rose-500">
                <Upload className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-medium">Add Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
            {isCompressing && (
              <p className="text-xs text-rose-500 animate-pulse">Compressing images...</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sunset Picnic at Sunset Cliffs"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 focus:ring-2 focus:ring-rose-500/50 outline-none"
            />
          </div>

          {/* Date & Location Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-rose-500" />
                Memory Date
              </label>
              <input
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 focus:ring-2 focus:ring-rose-500/50 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. San Diego, CA"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 focus:ring-2 focus:ring-rose-500/50 outline-none"
              />
            </div>
          </div>

          {/* Caption / Story */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Caption / Story
            </label>
            <textarea
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a sweet memory description..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 focus:ring-2 focus:ring-rose-500/50 outline-none"
            />
          </div>

          {/* Album & Weather & Tags Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <FolderHeart className="w-3.5 h-3.5 text-rose-500" />
                Album
              </label>
              <select
                value={albumId}
                onChange={(e) => setAlbumId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 focus:ring-2 focus:ring-rose-500/50 outline-none"
              >
                <option value="">No Album</option>
                {albums.map((alb) => (
                  <option key={alb.id} value={alb.id}>
                    {alb.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <CloudSun className="w-3.5 h-3.5 text-amber-400" />
                Weather
              </label>
              <select
                value={weather}
                onChange={(e) => setWeather(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 focus:ring-2 focus:ring-rose-500/50 outline-none"
              >
                <option value="Sunny ☀️">Sunny ☀️</option>
                <option value="Sunset 🌅">Sunset 🌅</option>
                <option value="Cloudy ☁️">Cloudy ☁️</option>
                <option value="Rainy 🌧️">Rainy 🌧️</option>
                <option value="Snowy ❄️">Snowy ❄️</option>
                <option value="Starlit Night 🌌">Starlit Night 🌌</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-rose-500" />
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="vacation, date, food"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 focus:ring-2 focus:ring-rose-500/50 outline-none"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={isFavorite}
                onChange={(e) => setIsFavorite(e.target.checked)}
                className="w-4 h-4 accent-rose-500 rounded"
              />
              Mark as Favorite ❤️
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="w-4 h-4 accent-rose-500 rounded"
              />
              Private memory (only me)
            </label>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-600 shadow-md hover:opacity-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : initialData ? 'Update Memory' : 'Save Memory'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
