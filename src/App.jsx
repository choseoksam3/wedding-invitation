import { lazy, Suspense, useState, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import './App.css';
import BgmPlayer from './components/BgmPlayer';
import PixelIntro from './components/PixelIntro';

const PixelLayout = lazy(() => import('./layouts/PixelLayout'));

function getInitialShowIntro() {
  try {
    return !sessionStorage.getItem('pixel-intro-shown');
  } catch {
    return true;
  }
}

export default function App() {
  const [showIntro, setShowIntro] = useState(() => getInitialShowIntro());
  const bgmRef = useRef(null);

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
    try {
      sessionStorage.setItem('pixel-intro-shown', '1');
    } catch {}
    // Auto-play BGM after intro
    if (bgmRef.current) bgmRef.current.play();
  }, []);

  const handleReplayIntro = useCallback(() => {
    try { sessionStorage.removeItem('pixel-intro-shown'); } catch {}
    setShowIntro(true);
  }, []);

  return (
    <>
      <AnimatePresence>
        {showIntro && (
          <PixelIntro onComplete={handleIntroComplete} />
        )}
      </AnimatePresence>

      <BgmPlayer ref={bgmRef} />

      {/* Replay Intro button */}
      {!showIntro && (
        <motion.button
          onClick={handleReplayIntro}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="fixed top-4 left-4 z-50 w-10 h-10 rounded-full bg-white/80 backdrop-blur shadow-md flex items-center justify-center"
          style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '14px' }}
          aria-label="인트로 다시보기"
          title="인트로 다시보기"
        >
          🎮
        </motion.button>
      )}

      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <p className="font-serif text-warm-400 animate-pulse">Loading...</p>
          </div>
        }
      >
        <PixelLayout />
      </Suspense>
    </>
  );
}
