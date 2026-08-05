import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, X } from 'lucide-react';

interface ProposalGalleryProps {
  coverImage?: string;
  title: string;
  className?: string;
}

export const ProposalGallery: React.FC<ProposalGalleryProps> = ({ coverImage, title, className }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!coverImage) return null;

  return (
    <>
      <div className={`relative overflow-hidden rounded-2xl group border border-border/40 ${className}`}>
        <img
          src={coverImage}
          alt={title}
          loading="lazy"
          className="w-full h-48 sm:h-64 object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-3">
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 rounded-xl bg-black/60 text-white backdrop-blur-md hover:bg-black/80 transition-colors flex items-center gap-1 text-xs"
          >
            <Maximize2 className="w-4 h-4" />
            <span>Full Image</span>
          </button>
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4"
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={coverImage}
              alt={title}
              className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
