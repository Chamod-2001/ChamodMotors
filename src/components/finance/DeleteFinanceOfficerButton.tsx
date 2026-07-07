'use client';

import { useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { deleteFinanceOfficerAction } from '@/app/finance/actions';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function DeleteFinanceOfficerButton({ officerId }: { officerId: string }) {
  const [isPending, startTransition] = useTransition();
  const { t } = useLanguage();

  function handleDelete() {
    if (!confirm('මේ officer ව delete කරන්නද?')) return;
    startTransition(() => {
      deleteFinanceOfficerAction(officerId);
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="flex items-center gap-1 rounded-xl border-2 border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      <Trash2 size={16} /> {t('delete')}
    </button>
  );
}
