'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'mdms-theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Server always renders 'light'; the effect below syncs the real stored
  // preference (set synchronously pre-hydration by the inline script in
  // layout.tsx) so this stays consistent with the DOM class it already applied.
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from DOM class set by the pre-hydration inline script
    setThemeState(isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    setThemeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      document.documentElement.classList.toggle('dark', next === 'dark');
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  };

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
