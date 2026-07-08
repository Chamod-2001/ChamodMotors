'use client';

import { clsx } from 'clsx';
import { useSidebar } from './SidebarContext';

export function SidebarContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <div
      className={clsx(
        // min-w-0 matters here: without it, a flex column won't shrink below
        // its widest descendant's natural content size — so a horizontally
        // scrollable row deep inside a page (e.g. the vehicle photo gallery)
        // would otherwise stretch this whole column past the viewport width
        // instead of staying clipped to its own overflow-x-auto scrollbar.
        'flex min-h-screen min-w-0 flex-col pb-16 transition-[padding] duration-200 md:pb-0 md:pl-[72px]',
        !collapsed && 'md:pl-60'
      )}
    >
      {children}
    </div>
  );
}
