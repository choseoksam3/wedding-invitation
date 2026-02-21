import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { weddingConfig } from '../config/wedding';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

// placeholder 이미지 (실제 사진 추가 전)
const placeholders = [
  { id: 1, color: 'bg-warm-200' },
  { id: 2, color: 'bg-warm-300' },
  { id: 3, color: 'bg-warm-200' },
  { id: 4, color: 'bg-warm-300' },
  { id: 5, color: 'bg-warm-200' },
  { id: 6, color: 'bg-warm-300' },
];

export default function Gallery() {
  const [selectedIdx, setSelectedIdx] = useState(null);
  const images = weddingConfig.galleryImages.length > 0
    ? weddingConfig.galleryImages
    : null;

  return (
    <motion.section
      className="py-20 px-6"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
    >
      <motion.h2
        variants={fadeInUp}
        className="font-serif text-center text-warm-600 text-lg mb-8 tracking-wider"
      >
        GALLERY
      </motion.h2>

      {/* 사진 그리드 */}
      <motion.div variants={fadeInUp} className="grid grid-cols-3 gap-1.5 max-w-sm mx-auto">
        {images
          ? images.map((src, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg overflow-hidden cursor-pointer"
                onClick={() => setSelectedIdx(i)}
              >
                <img
                  src={src}
                  alt={`갤러리 ${i + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
            ))
          : placeholders.map((p) => (
              <div
                key={p.id}
                className={`aspect-square rounded-lg ${p.color} flex items-center justify-center`}
              >
                <span className="text-warm-400 font-serif text-xs">Photo {p.id}</span>
              </div>
            ))}
      </motion.div>

      {/* 라이트박스 */}
      <AnimatePresence>
        {selectedIdx !== null && images && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedIdx(null)}
          >
            <motion.img
              src={images[selectedIdx]}
              alt="확대 사진"
              className="max-w-full max-h-[85vh] rounded-lg object-contain"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            />

            {/* 좌우 네비게이션 */}
            {selectedIdx > 0 && (
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-3xl p-2"
                onClick={(e) => { e.stopPropagation(); setSelectedIdx(selectedIdx - 1); }}
              >
                ‹
              </button>
            )}
            {selectedIdx < images.length - 1 && (
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-3xl p-2"
                onClick={(e) => { e.stopPropagation(); setSelectedIdx(selectedIdx + 1); }}
              >
                ›
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
