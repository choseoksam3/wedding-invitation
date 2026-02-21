import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../hooks/useTheme.jsx';
import { useLayout, layouts } from '../hooks/useLayout.jsx';
import { themeList } from '../config/themes';

export default function DesignSwitcher() {
  const { themeId, setThemeId } = useTheme();
  const { layoutId, setLayoutId } = useLayout();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('layout');

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <motion.button
        onClick={() => setOpen(!open)}
        className="w-11 h-11 rounded-full bg-white/90 backdrop-blur shadow-lg flex items-center justify-center text-lg border border-warm-200"
        whileTap={{ scale: 0.9 }}
      >
        🎨
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-14 left-0 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl w-72 border border-warm-200 overflow-hidden"
          >
            {/* 탭 */}
            <div className="flex border-b border-warm-100">
              {[
                { id: 'layout', label: '레이아웃' },
                { id: 'theme', label: '컬러 테마' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                    tab === t.id
                      ? 'text-warm-700 border-b-2 border-warm-500'
                      : 'text-warm-400'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="p-3 max-h-80 overflow-y-auto">
              {tab === 'layout' && (
                <div className="space-y-1.5">
                  {layouts.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => {
                        setLayoutId(l.id);
                        setOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${
                        layoutId === l.id
                          ? 'bg-warm-100 ring-2 ring-warm-400'
                          : 'hover:bg-warm-50'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-warm-100 flex items-center justify-center text-lg shrink-0">
                        {l.id === 'classic' && '📜'}
                        {l.id === 'kinetic' && '𝐀'}
                        {l.id === 'scroll-story' && '📖'}
                        {l.id === 'pixel' && '👾'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-warm-800">
                          {l.name}
                          {layoutId === l.id && <span className="ml-1 text-warm-400 text-xs">✓</span>}
                        </p>
                        <p className="text-xs text-warm-400">{l.desc}</p>
                      </div>
                    </button>
                  ))}

                  {/* 인트로 재생 버튼 */}
                  <button
                    onClick={() => {
                      try {
                        sessionStorage.removeItem('intro-shown');
                        sessionStorage.removeItem('pixel-intro-shown');
                      } catch {}
                      setOpen(false);
                      window.location.reload();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all hover:bg-warm-50 border border-dashed border-warm-200 mt-2"
                  >
                    <div className="w-10 h-10 rounded-lg bg-warm-50 flex items-center justify-center text-lg shrink-0">
                      ▶
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-warm-700">인트로 다시보기</p>
                      <p className="text-xs text-warm-400">현재 레이아웃의 인트로 재생</p>
                    </div>
                  </button>
                </div>
              )}

              {tab === 'theme' && (
                <div className="space-y-1.5">
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
                      <div className="flex gap-0.5 shrink-0">
                        {[t.colors['--color-warm-300'], t.colors['--color-warm-500'], t.colors['--color-warm-700']].map(
                          (c, i) => (
                            <div key={i} className="w-4 h-4 rounded-full" style={{ backgroundColor: c }} />
                          )
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-warm-800">
                          {t.name}
                          {themeId === t.id && <span className="ml-1 text-warm-400 text-xs">✓</span>}
                        </p>
                        <p className="text-xs text-warm-400 truncate">{t.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
