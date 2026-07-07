import Link from 'next/link';
import { getEmployeeSalesReport, currentMonthValue } from '@/lib/queries/reports';
import { MonthPicker } from '@/components/reports/MonthPicker';
import { Card } from '@/components/ui/Card';
import { AppShell } from '@/components/layout/AppShell';
import { formatLKR } from '@/lib/format';
import { Trophy } from 'lucide-react';
import { requireAdmin } from '@/lib/queries/session';
import { getTranslator } from '@/lib/i18n/server';

export default async function EmployeeSalesReportPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  await requireAdmin();
  const { month } = await searchParams;
  const selectedMonth = month || currentMonthValue();
  const rows = await getEmployeeSalesReport(selectedMonth);
  const t = await getTranslator();

  return (
    <AppShell title={t('employee_sales_report')}>
    <div className="mx-auto max-w-2xl space-y-4 p-4">
      <Link href="/reports" className="text-sm font-medium text-brand">
        {t('back')}
      </Link>
      <h1 className="text-xl font-bold text-slate-900">{t('employee_sales_report')}</h1>

      <MonthPicker month={selectedMonth} />

      <Card>
        {rows.length === 0 ? (
          <p className="py-10 text-center text-slate-400">{t('no_sales_recorded_this_month')}</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {rows.map((row, index) => (
              <li key={row.employeeId} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-2 min-w-0">
                  {index === 0 && <Trophy size={18} className="shrink-0 text-amber-500" />}
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">{row.fullName}</p>
                    <p className="text-sm text-slate-500">
                      {row.salesCount} {t('sale_count_suffix')} · {t('profit_prefix')} {formatLKR(row.totalProfit)}
                    </p>
                  </div>
                </div>
                <p className="shrink-0 font-semibold text-slate-900">{formatLKR(row.totalRevenue)}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
    </AppShell>
  );
}
