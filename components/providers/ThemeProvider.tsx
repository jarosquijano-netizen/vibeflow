'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { ThemeId } from '@/lib/themes';

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (id: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'default',
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>('default');

  useEffect(() => {
    const saved = localStorage.getItem('vibeflow-theme') as ThemeId | null;
    if (saved === 'cyber' || saved === 'default') {
      setThemeState(saved);
      document.documentElement.setAttribute('data-theme', saved);
    }
  }, []);

  const setTheme = (id: ThemeId) => {
    setThemeState(id);
    document.documentElement.setAttribute('data-theme', id);
    localStorage.setItem('vibeflow-theme', id);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
