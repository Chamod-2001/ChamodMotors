'use client';

import { useTransition } from 'react';
import { clsx } from 'clsx';
import { setEmployeeActiveAction } from '@/app/employees/actions';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function EmployeeActiveToggle({ employeeId, isActive }: { employeeId: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition();
  const { t } = useLanguage();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(async () => { await setEmployeeActiveAction(employeeId, !isActive); })}
      className={clsx(
        'rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50',
        isActive
          ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:hover:bg-red-950/40'
          : 'bg-green-50 text-green-600 hover:bg-green-100 dark:hover:bg-green-950/40'
      )}
    >
      {isPending ? '...' : isActive ? t('deactivate') : t('activate')}
    </button>
  );
}
