import { Card } from '@/components/ui/Card';
import { getTranslator } from '@/lib/i18n/server';
import type { EmployeePerformanceRow } from '@/lib/queries/dashboard';
import { Trophy } from 'lucide-react';

export async function EmployeePerformanceList({
  employees,
  title,
}: {
  employees: EmployeePerformanceRow[];
  title: string;
}) {
  const t = await getTranslator();

  return (
    <Card>
      <h2 className="mb-3 text-lg font-semibold text-slate-900">{title}</h2>
      {employees.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-400">{t('no_sales_this_month_yet')}</p>
      ) : (
        <ul className="space-y-2">
          {employees.map((emp, index) => (
            <li key={emp.employeeId} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
              <div className="flex items-center gap-2">
                {index === 0 && <Trophy size={18} className="text-amber-500" />}
                <span className="font-medium text-slate-800">{emp.fullName}</span>
              </div>
              <span className="rounded-full bg-brand-light px-3 py-1 text-sm font-semibold text-brand-dark">
                {emp.salesCount} {t('sale_count_suffix')}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
