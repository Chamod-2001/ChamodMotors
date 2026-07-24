'use client';

import { useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { deleteFinanceOfficerAction } from '@/app/finance/actions';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function DeleteFinanceOfficerButton({ officerId }: { officerId: string }) {
  const [isPending, startTransition] = useTransition();
  const { t } = useLanguage();

  function handleDelete() {
    if (!confirm(t('delete_officer_confirm'))) return;
    startTransition(async () => {
      const result = await deleteFinanceOfficerAction(officerId);
      if (result?.error) alert(result.error);
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
