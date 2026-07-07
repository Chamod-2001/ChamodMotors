'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { logoutAction } from '@/app/login/actions';
import { LogOut } from 'lucide-react';

export function LogoutButton() {
  const { t } = useLanguage();
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="flex items-center gap-1.5 rounded-lg border border-red-200 px-2 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900 dark:text-red-500 dark:hover:bg-red-950/40"
      >
        <LogOut size={14} />
        <span className="hidden sm:inline">{t('logout')}</span>
      </button>
    </form>
  );
}
