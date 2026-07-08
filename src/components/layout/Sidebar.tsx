'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CalendarDays, Bike, Users, Landmark, BarChart3, UserCog, History, Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { useSidebar } from './SidebarContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import logo from '@/assets/ChamodMotors.png';
import type { TranslationKey } from '@/lib/i18n/translations';

const TABS: { href: string; labelKey: TranslationKey; icon: typeof LayoutDashboard }[] = [
  { href: '/dashboard', labelKey: 'dashboard', icon: LayoutDashboard },
  { href: '/calendar', labelKey: 'calendar', icon: CalendarDays },
  { href: '/vehicles', labelKey: 'vehicles', icon: Bike },
  { href: '/customers', labelKey: 'customers', icon: Users },
  { href: '/finance', labelKey: 'finance', icon: Landmark },
  { href: '/profile', labelKey: 'profile', icon: Building2 },
];

const ADMIN_TABS: { href: string; labelKey: TranslationKey; icon: typeof LayoutDashboard }[] = [
  { href: '/reports', labelKey: 'reports', icon: BarChart3 },
  { href: '/employees', labelKey: 'employees', icon: UserCog },
  { href: '/activity', labelKey: 'activity', icon: History },
];

// Tablet/desktop only — mobile uses BottomNav instead (see AppShell).
export function Sidebar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();
  const { t } = useLanguage();
  const tabs = isAdmin ? [...TABS, ...ADMIN_TABS] : TABS;

  return (
    <nav
      aria-label="Main navigation"
      className={clsx(
        'fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-slate-200 bg-white transition-[width] duration-200 md:flex dark:border-slate-800 dark:bg-slate-900',
        collapsed ? 'w-[72px]' : 'w-60'
      )}
    >
      <div className="flex h-16 shrink-0 items-center justify-center overflow-hidden border-b border-slate-200 px-2 dark:border-slate-800">
        <Image
          src={logo}
          alt="Chamod Motors"
          className={clsx('w-auto object-contain transition-all', collapsed ? 'h-10' : 'h-12')}
          priority
        />
      </div>

      <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
        {tabs.map(({ href, labelKey, icon: Icon }) => {
          const label = t(labelKey);
          const isActive = pathname === href || pathname?.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={clsx(
                'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors',
                collapsed && 'justify-center',
                isActive
                  ? 'bg-brand-light text-brand-dark dark:bg-brand-light dark:text-brand'
                  : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              )}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </div>

      <button
        type="button"
        onClick={toggle}
        aria-label={collapsed ? t('expand_sidebar') : t('collapse_sidebar')}
        className="flex h-12 shrink-0 items-center justify-center gap-2 border-t border-slate-200 text-slate-500 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        {!collapsed && <span className="text-sm font-medium">{t('collapse')}</span>}
      </button>
    </nav>
  );
}
