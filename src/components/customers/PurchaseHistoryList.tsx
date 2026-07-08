import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { formatLKR } from '@/lib/format';
import { getTranslator } from '@/lib/i18n/server';
import type { PurchaseHistoryItem } from '@/lib/queries/customers';

export async function PurchaseHistoryList({ history, isAdmin }: { history: PurchaseHistoryItem[]; isAdmin: boolean }) {
  const t = await getTranslator();

  return (
    <Card>
      <h2 className="mb-3 text-lg font-semibold text-slate-900">{t('purchase_history')}</h2>
      {history.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-400">{t('no_purchases_yet')}</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {history.map((item) => (
            <li key={item.saleId} className="flex items-center justify-between py-3">
              <Link href={`/vehicles/${item.vehicleId}`} className="min-w-0 font-medium text-brand hover:underline">
                <span className="block truncate">{item.vehicleLabel}</span>
              </Link>
              <div className="shrink-0 text-right">
                {isAdmin && <p className="font-semibold text-slate-900">{formatLKR(item.salePrice)}</p>}
                <p className="text-xs text-slate-400">
                  {new Date(item.purchaseDate).toLocaleDateString('en-LK', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
