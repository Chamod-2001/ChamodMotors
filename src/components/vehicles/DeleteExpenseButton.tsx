'use client';

import { useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { deleteVehicleExpenseAction } from '@/app/vehicles/expenses/actions';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function DeleteExpenseButton({ expenseId, vehicleId }: { expenseId: string; vehicleId: string }) {
  const [isPending, startTransition] = useTransition();
  const { t } = useLanguage();

  function handleDelete() {
    if (!confirm(t('delete_expense_confirm'))) return;
    startTransition(() => {
      deleteVehicleExpenseAction(expenseId, vehicleId);
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      aria-label={t('delete')}
      className="shrink-0 rounded-lg p-1.5 text-red-500 hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-950"
    >
      <Trash2 size={16} />
    </button>
  );
}
