'use client';

import { clsx } from 'clsx';
import { useSidebar } from './SidebarContext';

export function SidebarContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <div
      className={clsx(
        // Mobile: no left offset (Sidebar is hidden, BottomNav is used instead),
        // but leave room at the bottom for the fixed BottomNav bar.
        'flex min-h-screen flex-col pb-16 transition-[padding] duration-200 md:pb-0 md:pl-[72px]',
        !collapsed && 'md:pl-60'
      )}
    >
      {children}
    </div>
  );
}
