import { motion } from 'framer-motion';
import { weddingConfig } from '../config/wedding';

export default function MainCover() {
  const date = new Date(weddingConfig.date);
  const formatted = `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}. ${date.toLocaleString('ko-KR', { weekday: 'long' })}`;

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center bg-warm-100 overflow-hidden">
      {/* 배경 장식 */}
      <div className="absolute inset-0 bg-gradient-to-b from-warm-50 via-warm-100 to-warm-50" />

      <motion.div
        className="relative z-10 text-center px-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      >
        {/* 상단 장식 */}
        <motion.p
          className="font-serif text-warm-400 text-sm tracking-[0.3em] mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
        >
          WEDDING INVITATION
        </motion.p>

        {/* 대표 사진 영역 */}
        <motion.div
          className="w-64 h-80 mx-auto mb-10 rounded-2xl overflow-hidden shadow-lg bg-warm-200"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          {weddingConfig.galleryImages[0] ? (
            <img
              src={weddingConfig.galleryImages[0]}
              alt="웨딩 사진"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-warm-400 font-serif text-lg">
              Photo
            </div>
          )}
        </motion.div>

        {/* 이름 */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
        >
          <p className="font-serif text-2xl text-warm-800 tracking-wider">
            {weddingConfig.groom.name}
            <span className="text-warm-400 mx-3 text-lg">&</span>
            {weddingConfig.bride.name}
          </p>
        </motion.div>

        {/* 날짜 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 1 }}
        >
          <p className="font-serif text-warm-500 text-sm tracking-wider">
            {formatted}
          </p>
          <p className="font-serif text-warm-500 text-sm mt-1">
            오전 11시
          </p>
          <p className="font-serif text-warm-400 text-xs mt-2">
            {weddingConfig.location.name} {weddingConfig.location.hall}
          </p>
        </motion.div>

        {/* 스크롤 안내 */}
        <motion.div
          className="mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-warm-300 text-2xl"
          >
            ∨
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
