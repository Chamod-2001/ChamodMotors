import { Wrench, ExternalLink } from 'lucide-react';
import { getTranslator } from '@/lib/i18n/server';
import { formatLKR } from '@/lib/format';
import { DeleteExpenseButton } from './DeleteExpenseButton';
import type { VehicleExpenseItem } from '@/lib/queries/vehicleExpenses';
import type { VehicleExpenseType } from '../../../types/database.types';
import type { TranslationKey } from '@/lib/i18n/translations';

const EXPENSE_TYPE_LABEL_KEY: Record<VehicleExpenseType, TranslationKey> = {
  paint: 'expense_type_paint',
  upholstery: 'expense_type_upholstery',
  parts: 'expense_type_parts',
  labor: 'expense_type_labor',
  cleaning: 'expense_type_cleaning',
  other: 'expense_type_other',
};

export async function VehicleExpenseList({ items, vehicleId }: { items: VehicleExpenseItem[]; vehicleId: string }) {
  const t = await getTranslator();

  if (items.length === 0) {
    return <p className="py-4 text-center text-sm text-slate-400">{t('no_expenses_yet')}</p>;
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand-dark dark:bg-brand/20 dark:text-brand">
            <Wrench size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
              {t(EXPENSE_TYPE_LABEL_KEY[item.expenseType])}
            </p>
            <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-400">
              <span>{new Date(item.createdAt).toLocaleDateString('en-LK', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              {item.description && <span className="truncate">· {item.description}</span>}
            </div>
          </div>
          <span className="shrink-0 text-sm font-semibold text-slate-700 dark:text-slate-200">{formatLKR(item.amount)}</span>
          {item.receiptSignedUrl && (
            <a
              href={item.receiptSignedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-brand-dark dark:text-brand"
              aria-label={t('view_document')}
            >
              <ExternalLink size={14} />
            </a>
          )}
          <DeleteExpenseButton expenseId={item.id} vehicleId={vehicleId} />
        </li>
      ))}
    </ul>
  );
}
