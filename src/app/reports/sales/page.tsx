import Link from 'next/link';
import { getMonthlySalesReport, currentMonthValue } from '@/lib/queries/reports';
import { MonthPicker } from '@/components/reports/MonthPicker';
import { Card } from '@/components/ui/Card';
import { AppShell } from '@/components/layout/AppShell';
import { formatLKR } from '@/lib/format';
import { requireAdmin } from '@/lib/queries/session';
import { getTranslator } from '@/lib/i18n/server';

export default async function SalesReportPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  await requireAdmin();
  const { month } = await searchParams;
  const selectedMonth = month || currentMonthValue();
  const { rows, totalCount, totalRevenue } = await getMonthlySalesReport(selectedMonth);
  const t = await getTranslator();

  return (
    <AppShell title={t('monthly_sales_report')}>
    <div className="mx-auto max-w-2xl space-y-4 p-4">
      <Link href="/reports" className="text-sm font-medium text-brand">
        {t('back')}
      </Link>
      <h1 className="text-xl font-bold text-slate-900">{t('monthly_sales_report')}</h1>

      <MonthPicker month={selectedMonth} />

      <div className="grid grid-cols-2 gap-3">
        <Card className="text-center">
          <p className="text-sm text-slate-500">{t('total_sales')}</p>
          <p className="text-2xl font-bold text-slate-900">{totalCount}</p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-slate-500">{t('total_revenue')}</p>
          <p className="text-2xl font-bold text-brand">{formatLKR(totalRevenue)}</p>
        </Card>
      </div>

      <Card>
        {rows.length === 0 ? (
          <p className="py-10 text-center text-slate-400">{t('no_sales_in_month')}</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {rows.map((row) => (
              <li key={row.id} className="flex items-center justify-between py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">{row.vehicle_label}</p>
                  <p className="truncate text-sm text-slate-500">
                    {row.customer_name}
                    {row.sold_by_name ? ` · ${t('sold_by_prefix')} ${row.sold_by_name}` : ''}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-semibold text-slate-900">{formatLKR(row.sale_price)}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(row.purchase_date).toLocaleDateString('en-LK', { day: '2-digit', month: 'short' })}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
    </AppShell>
  );
}
