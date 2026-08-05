import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';

interface MemoryCarouselProps {
  images: string[];
  title?: string;
  className?: string;
}

export const MemoryCarousel: React.FC<MemoryCarouselProps> = ({
  images,
  title = 'Memory photo',
  className = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className={`w-full h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 ${className}`}>
        No image available
      </div>
    );
  }

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <div className={`relative group overflow-hidden rounded-2xl bg-black/5 dark:bg-black/40 ${className}`}>
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            alt={`${title} ${currentIndex + 1}`}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.25 }}
            className="w-full h-full object-cover rounded-2xl select-none"
            loading="lazy"
          />
        </AnimatePresence>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60 backdrop-blur-sm"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60 backdrop-blur-sm"
              aria-label="Next photo"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Fullscreen Trigger */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFullscreen(true);
          }}
          className="absolute top-3 right-3 p-2 rounded-xl bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60 backdrop-blur-sm"
          title="Fullscreen photo"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/50'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 p-3 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <img
            src={images[currentIndex]}
            alt={title}
            className="max-w-full max-h-[90vh] object-contain rounded-xl"
          />

          {images.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
};
