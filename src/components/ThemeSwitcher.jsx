import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../hooks/useTheme.jsx';
import { themeList } from '../config/themes';

export default function ThemeSwitcher() {
  const { themeId, setThemeId } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {/* 토글 버튼 */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="w-11 h-11 rounded-full bg-white/90 backdrop-blur shadow-lg flex items-center justify-center text-lg border border-warm-200"
        whileTap={{ scale: 0.9 }}
      >
        🎨
      </motion.button>

      {/* 테마 패널 */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-14 left-0 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-4 w-64 border border-warm-200"
          >
            <p className="text-xs font-bold text-warm-700 mb-3 tracking-wider">
              테마 선택
            </p>
            <div className="space-y-2">
              {themeList.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setThemeId(t.id);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                    themeId === t.id
                      ? 'bg-warm-100 ring-2 ring-warm-400'
                      : 'hover:bg-warm-50'
                  }`}
                >
                  {/* 색상 프리뷰 */}
                  <div className="flex gap-0.5 shrink-0">
                    {[t.colors['--color-warm-300'], t.colors['--color-warm-500'], t.colors['--color-warm-700']].map(
                      (c, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: c }}
                        />
                      )
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-warm-800 truncate">
                      {t.name}
                      {themeId === t.id && (
                        <span className="ml-1 text-xs text-warm-400">✓</span>
                      )}
                    </p>
                    <p className="text-xs text-warm-400 truncate">{t.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
