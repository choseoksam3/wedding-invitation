import { lazy, Suspense, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import './App.css';
import { useLayout } from './hooks/useLayout.jsx';
import BgmPlayer from './components/BgmPlayer';
import DesignSwitcher from './components/DesignSwitcher';
import IntroOpening from './components/IntroOpening';
import PixelIntro from './components/PixelIntro';


const ClassicLayout = lazy(() => import('./layouts/ClassicLayout'));
const KineticLayout = lazy(() => import('./layouts/KineticLayout'));
const ScrollStoryLayout = lazy(() => import('./layouts/ScrollStoryLayout'));
const PixelLayout = lazy(() => import('./layouts/PixelLayout'));

const layoutMap = {
  classic: ClassicLayout,
  kinetic: KineticLayout,
  'scroll-story': ScrollStoryLayout,
  pixel: PixelLayout,
};

function getInitialShowIntro(layoutId) {
  try {
    const key = layoutId === 'pixel' ? 'pixel-intro-shown' : 'intro-shown';
    return !sessionStorage.getItem(key);
  } catch {
    return true;
  }
}

export default function App() {
  const { layoutId } = useLayout();
  const Layout = layoutMap[layoutId] || ClassicLayout;
  const [showIntro, setShowIntro] = useState(() => getInitialShowIntro(layoutId));

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
    try {
      const key = layoutId === 'pixel' ? 'pixel-intro-shown' : 'intro-shown';
      sessionStorage.setItem(key, '1');
    } catch {
      // sessionStorage not available
    }
  }, [layoutId]);

  return (
    <>
      <AnimatePresence>
        {showIntro && layoutId === 'pixel' && (
          <PixelIntro onComplete={handleIntroComplete} />
        )}
        {showIntro && layoutId !== 'pixel' && (
          <IntroOpening onComplete={handleIntroComplete} />
        )}
      </AnimatePresence>

      <BgmPlayer />
      <DesignSwitcher />
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <p className="font-serif text-warm-400 animate-pulse">Loading...</p>
          </div>
        }
      >
        <Layout />
      </Suspense>
    </>
  );
}
