'use client';

import { clsx } from 'clsx';
import { useSidebar } from './SidebarContext';

export function SidebarContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <div
      className={clsx(
        'flex min-h-screen flex-col pl-[72px] transition-[padding] duration-200',
        !collapsed && 'md:pl-60'
      )}
    >
      {children}
    </div>
  );
}
