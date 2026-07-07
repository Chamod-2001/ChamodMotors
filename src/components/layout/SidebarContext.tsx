'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface SidebarContextValue {
  collapsed: boolean;
  toggle: () => void;
  close: () => void;
}

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined);

const STORAGE_KEY = 'mdms-sidebar-collapsed';

export function SidebarProvider({ children }: { children: ReactNode }) {
  // Expanded (labels visible) by default so section names are readable at a
  // glance; users can still collapse to icon-only via the toggle button.
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from localStorage on mount, required to avoid SSR/client hydration mismatch
      setCollapsed(stored === 'true');
    }
  }, []);

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  };

  const close = () => {
    setCollapsed(true);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  return (
    <SidebarContext.Provider value={{ collapsed, toggle, close }}>{children}</SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
