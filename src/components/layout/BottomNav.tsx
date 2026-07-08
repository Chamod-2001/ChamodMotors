'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Bike, Users, Landmark, CalendarDays, Building2, BarChart3, UserCog, History, Menu, X } from 'lucide-react';
import { clsx } from 'clsx';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { TranslationKey } from '@/lib/i18n/translations';

const PRIMARY_TABS: { href: string; labelKey: TranslationKey; icon: typeof LayoutDashboard }[] = [
  { href: '/dashboard', labelKey: 'dashboard', icon: LayoutDashboard },
  { href: '/vehicles', labelKey: 'vehicles', icon: Bike },
  { href: '/customers', labelKey: 'customers', icon: Users },
  { href: '/finance', labelKey: 'finance', icon: Landmark },
];

const MORE_TABS: { href: string; labelKey: TranslationKey; icon: typeof LayoutDashboard }[] = [
  { href: '/calendar', labelKey: 'calendar', icon: CalendarDays },
  { href: '/profile', labelKey: 'profile', icon: Building2 },
];

const MORE_ADMIN_TABS: { href: string; labelKey: TranslationKey; icon: typeof LayoutDashboard }[] = [
  { href: '/reports', labelKey: 'reports', icon: BarChart3 },
  { href: '/employees', labelKey: 'employees', icon: UserCog },
  { href: '/activity', labelKey: 'activity', icon: History },
];

// Mobile only — tablet/desktop use Sidebar instead (see AppShell). A bottom
// bar realistically fits ~5 icons before it's cramped, so only the most-used
// sections get a direct tab; everything else lives behind "More".
export function BottomNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [moreOpen, setMoreOpen] = useState(false);

  const moreTabs = isAdmin ? [...MORE_TABS, ...MORE_ADMIN_TABS] : MORE_TABS;
  const isMoreActive = moreTabs.some((tab) => pathname === tab.href || pathname?.startsWith(`${tab.href}/`));

  return (
    <div className="md:hidden">
      {moreOpen && (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setMoreOpen(false)} aria-hidden="true" />
      )}

      {moreOpen && (
        <div className="fixed inset-x-0 bottom-16 z-40 rounded-t-2xl border-t border-slate-200 bg-white p-2 shadow-lg dark:border-slate-800 dark:bg-slate-900">
          {moreTabs.map(({ href, labelKey, icon: Icon }) => {
            const label = t(labelKey);
            const isActive = pathname === href || pathname?.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMoreOpen(false)}
                className={clsx(
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium',
                  isActive
                    ? 'bg-brand-light text-brand-dark dark:bg-brand-light dark:text-brand'
                    : 'text-slate-600 dark:text-slate-300'
                )}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                {label}
              </Link>
            );
          })}
        </div>
      )}

      <nav
        aria-label="Bottom navigation"
        className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-stretch border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
      >
        {PRIMARY_TABS.map(({ href, labelKey, icon: Icon }) => {
          const label = t(labelKey);
          const isActive = pathname === href || pathname?.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMoreOpen(false)}
              className={clsx(
                'flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium',
                isActive ? 'text-brand' : 'text-slate-500 dark:text-slate-400'
              )}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="truncate px-1">{label}</span>
            </Link>
          );
        })}

        <button
          type="button"
          onClick={() => setMoreOpen((prev) => !prev)}
          className={clsx(
            'flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium',
            moreOpen || isMoreActive ? 'text-brand' : 'text-slate-500 dark:text-slate-400'
          )}
        >
          {moreOpen ? <X size={20} /> : <Menu size={20} strokeWidth={isMoreActive ? 2.5 : 2} />}
          <span>{t('more_label')}</span>
        </button>
      </nav>
    </div>
  );
}
