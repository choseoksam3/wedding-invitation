import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { motion } from 'framer-motion';
import { weddingConfig } from '../config/wedding';

const BgmPlayer = forwardRef(function BgmPlayer(_, ref) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const userPaused = useRef(false);

  useImperativeHandle(ref, () => ({
    play: () => {
      if (audioRef.current && !playing && !userPaused.current) {
        audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
      }
    },
  }));

  useEffect(() => {
    const handleFirstInteraction = () => {
      if (audioRef.current && !playing && !userPaused.current) {
        audioRef.current.play().then(() => {
          setPlaying(true);
        }).catch(() => {});
      }
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };

    if (!userPaused.current) {
      document.addEventListener('click', handleFirstInteraction);
      document.addEventListener('touchstart', handleFirstInteraction);
    }

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [playing]);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
      userPaused.current = true;
    } else {
      userPaused.current = false;
      audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  return (
    <>
      <audio ref={audioRef} src={weddingConfig.bgm} loop preload="auto" />
      <motion.button
        onClick={toggle}
        className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/80 backdrop-blur shadow-md flex items-center justify-center text-warm-600"
        whileTap={{ scale: 0.9 }}
        aria-label={playing ? 'BGM 정지' : 'BGM 재생'}
      >
        {playing ? (
          <motion.div
            className="flex gap-[2px]"
            initial={false}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-[3px] bg-warm-500 rounded-full"
                animate={{ height: [8, 16, 8] }}
                transition={{
                  repeat: Infinity,
                  duration: 0.6,
                  delay: i * 0.15,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </motion.div>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 2l10 6-10 6V2z" />
          </svg>
        )}
      </motion.button>
    </>
  );
});

export default BgmPlayer;
