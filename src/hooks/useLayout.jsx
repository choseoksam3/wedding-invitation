import { createContext, useContext, useState } from 'react';

const LayoutContext = createContext();

export const layouts = [
  { id: 'classic', name: '클래식', desc: '따뜻한 세로 스크롤' },
  { id: 'kinetic', name: '키네틱 타이포', desc: '대담한 활자 중심' },
  { id: 'scroll-story', name: '스크롤 스토리', desc: '몰입형 다크 시네마틱' },
  { id: 'pixel', name: '픽셀 RPG', desc: '개발자♥기획자 레트로 게임' },
];

export function LayoutProvider({ children }) {
  const [layoutId, setLayoutId] = useState(() => {
    return localStorage.getItem('wedding-layout') || 'classic';
  });

  const handleSetLayout = (id) => {
    localStorage.setItem('wedding-layout', id);
    setLayoutId(id);
  };

  return (
    <LayoutContext.Provider value={{ layoutId, setLayoutId: handleSetLayout }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  return useContext(LayoutContext);
}
