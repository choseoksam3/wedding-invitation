import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { weddingConfig } from '../config/wedding';

export default function IntroOpening({ onComplete }) {
  const groomName = weddingConfig.groom.name;
  const brideName = weddingConfig.bride.name;

  const weddingDate = new Date(weddingConfig.date);
  const year = weddingDate.getFullYear();
  const month = String(weddingDate.getMonth() + 1).padStart(2, '0');
  const day = String(weddingDate.getDate()).padStart(2, '0');
  const dateText = `${year}. ${month}. ${day}`;

  // Lock body scroll while intro is showing
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Trigger exit after full sequence
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -60 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1A1714',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
        }}
      >
        {/* Ornament line */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
          style={{
            width: '48px',
            height: '1px',
            backgroundColor: '#c8a878',
            marginBottom: '8px',
          }}
        />

        {/* Names row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          {/* Groom name - from left */}
          <motion.span
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.7, ease: 'easeOut' }}
            style={{
              fontFamily: "'Nanum Myeongjo', serif",
              fontSize: '32px',
              fontWeight: 400,
              color: '#f0e8d8',
              letterSpacing: '4px',
            }}
          >
            {groomName}
          </motion.span>

          {/* Ampersand */}
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.3, duration: 0.6, ease: 'easeOut' }}
            style={{
              fontFamily: "'Nanum Myeongjo', serif",
              fontSize: '15px',
              fontWeight: 300,
              color: '#c8a878',
            }}
          >
            &amp;
          </motion.span>

          {/* Bride name - from right */}
          <motion.span
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.8, duration: 0.7, ease: 'easeOut' }}
            style={{
              fontFamily: "'Nanum Myeongjo', serif",
              fontSize: '32px',
              fontWeight: 400,
              color: '#f0e8d8',
              letterSpacing: '4px',
            }}
          >
            {brideName}
          </motion.span>
        </div>

        {/* Date */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.3, duration: 0.6, ease: 'easeOut' }}
          style={{
            fontFamily: "'Nanum Myeongjo', serif",
            fontSize: '13px',
            fontWeight: 400,
            color: '#a08050',
            letterSpacing: '3px',
            marginTop: '4px',
          }}
        >
          {dateText}
        </motion.p>

        {/* Bottom ornament line */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 2.3, duration: 0.6, ease: 'easeOut' }}
          style={{
            width: '48px',
            height: '1px',
            backgroundColor: '#c8a878',
            marginTop: '4px',
          }}
        />
      </div>
    </motion.div>
  );
}
