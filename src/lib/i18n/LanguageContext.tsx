'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { translations, type LanguageMode, type TranslationKey } from './translations';

interface LanguageContextValue {
  mode: LanguageMode;
  setMode: (mode: LanguageMode) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const STORAGE_KEY = 'mdms-language-mode';

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Mixed mode is the recommended default for this dealership's staff.
  // Server always renders 'mixed'; the effect below syncs the real stored
  // preference in on the client after mount to avoid a hydration mismatch.
  const [mode, setModeState] = useState<LanguageMode>('mixed');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as LanguageMode | null;
    if (stored === 'english' || stored === 'sinhala' || stored === 'mixed') {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from localStorage on mount, required to avoid SSR/client hydration mismatch
      setModeState(stored);
      // Keep the cookie in step so Server Components see the same mode on the next request.
      document.cookie = `${STORAGE_KEY}=${stored}; path=/; max-age=31536000; SameSite=Lax`;
    }
  }, []);

  const setMode = (newMode: LanguageMode) => {
    setModeState(newMode);
    localStorage.setItem(STORAGE_KEY, newMode);
    // Also mirrored into a cookie so Server Components (which can't use this
    // React Context) can render in the same language via getServerTranslator().
    document.cookie = `${STORAGE_KEY}=${newMode}; path=/; max-age=31536000; SameSite=Lax`;
  };

  const t = (key: TranslationKey): string => {
    return translations[key]?.[mode] ?? String(key);
  };

  return (
    <LanguageContext.Provider value={{ mode, setMode, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

