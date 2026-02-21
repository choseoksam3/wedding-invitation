import { createContext, useContext, useState, useEffect } from 'react';
import { themes } from '../config/themes';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(() => {
    return localStorage.getItem('wedding-theme') || 'classic';
  });

  const theme = themes[themeId] || themes.classic;

  useEffect(() => {
    localStorage.setItem('wedding-theme', themeId);

    // CSS 변수 업데이트
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    root.style.setProperty('--font-serif', theme.fontSerif);
    document.body.style.color = theme.bodyColor;
  }, [themeId, theme]);

  return (
    <ThemeContext.Provider value={{ theme, themeId, setThemeId }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
