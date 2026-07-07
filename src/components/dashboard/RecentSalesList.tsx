import { Card } from '@/components/ui/Card';
import { formatLKR } from '@/lib/format';
import { getTranslator } from '@/lib/i18n/server';
import type { RecentSaleRow } from '@/lib/queries/dashboard';

export async function RecentSalesList({ sales, title }: { sales: RecentSaleRow[]; title: string }) {
  const t = await getTranslator();

  return (
    <Card>
      <h2 className="mb-3 text-lg font-semibold text-slate-900">{title}</h2>
      {sales.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-400">{t('no_sales_yet')}</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {sales.map((sale) => (
            <li key={sale.id} className="flex items-center justify-between py-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-900">{sale.vehicle_label}</p>
                <p className="truncate text-sm text-slate-500">{sale.customer_name}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-semibold text-slate-900">{formatLKR(sale.sale_price)}</p>
                <p className="text-xs text-slate-400">
                  {new Date(sale.purchase_date).toLocaleDateString('en-LK', { day: '2-digit', month: 'short' })}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
