import Link from 'next/link';
import { getCustomerPurchaseReport } from '@/lib/queries/reports';
import { Card } from '@/components/ui/Card';
import { AppShell } from '@/components/layout/AppShell';
import { formatLKR } from '@/lib/format';
import { requireAdmin } from '@/lib/queries/session';
import { getTranslator } from '@/lib/i18n/server';

export default async function CustomerPurchaseReportPage() {
  await requireAdmin();
  const rows = await getCustomerPurchaseReport();
  const t = await getTranslator();

  return (
    <AppShell title={t('customer_purchase_report')}>
    <div className="mx-auto max-w-2xl space-y-4 p-4">
      <Link href="/reports" className="text-sm font-medium text-brand">
        {t('back')}
      </Link>
      <h1 className="text-xl font-bold text-slate-900">{t('customer_purchase_report')}</h1>

      <Card>
        {rows.length === 0 ? (
          <p className="py-10 text-center text-slate-400">{t('no_purchases_recorded_yet')}</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {rows.map((row) => (
              <li key={row.customerId} className="flex items-center justify-between py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">{row.fullName}</p>
                  <p className="text-sm text-slate-500">
                    {row.purchaseCount} {t('purchased_vehicles_suffix')}
                  </p>
                </div>
                <p className="shrink-0 font-semibold text-slate-900">{formatLKR(row.totalSpent)}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
    </AppShell>
  );
}
