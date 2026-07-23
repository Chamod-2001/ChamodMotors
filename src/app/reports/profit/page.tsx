import Link from 'next/link';
import { getMonthlyProfitReport, currentMonthValue } from '@/lib/queries/reports';
import { MonthPicker } from '@/components/reports/MonthPicker';
import { Card } from '@/components/ui/Card';
import { AppShell } from '@/components/layout/AppShell';
import { formatLKR } from '@/lib/format';
import { requireAdmin } from '@/lib/queries/session';
import { getTranslator } from '@/lib/i18n/server';

export default async function ProfitReportPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  await requireAdmin();
  const { month } = await searchParams;
  const selectedMonth = month || currentMonthValue();
  const { rows, totalProfit } = await getMonthlyProfitReport(selectedMonth);
  const t = await getTranslator();

  return (
    <AppShell title={t('monthly_profit_report')}>
    <div className="mx-auto max-w-2xl space-y-4 p-4">
      <Link href="/reports" className="text-sm font-medium text-brand">
        {t('back')}
      </Link>
      <h1 className="text-xl font-bold text-slate-900">{t('monthly_profit_report')}</h1>

      <MonthPicker month={selectedMonth} />

      <Card className="text-center">
        <p className="text-sm text-slate-500">{t('total_gross_profit')}</p>
        <p className="text-3xl font-bold text-green-600">{formatLKR(totalProfit)}</p>
      </Card>

      <Card>
        {rows.length === 0 ? (
          <p className="py-10 text-center text-slate-400">{t('no_sales_in_month')}</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {rows.map((row) => (
              <li key={row.id} className="flex items-center justify-between py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">{row.vehicle_label}</p>
                  <p className="text-xs text-slate-400">
                    {t('buying_price')} {formatLKR(row.buying_price)}
                    {row.total_expenses > 0 && ` + ${t('total_expenses_label')} ${formatLKR(row.total_expenses)}`}
                    {' → '}
                    {t('selling_price')} {formatLKR(row.sale_price)}
                  </p>
                </div>
                <p className="shrink-0 font-semibold text-green-600">{formatLKR(row.profit)}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
    </AppShell>
  );
}
