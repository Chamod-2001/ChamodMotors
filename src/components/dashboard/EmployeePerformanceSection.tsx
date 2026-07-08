import { getEmployeePerformance } from '@/lib/queries/dashboard';
import { EmployeePerformanceList } from '@/components/dashboard/EmployeePerformanceList';
import type { Translator } from '@/lib/i18n/server';

export async function EmployeePerformanceSection({ t }: { t: Translator }) {
  const employeePerformance = await getEmployeePerformance();
  return <EmployeePerformanceList employees={employeePerformance} title={t('employee_performance')} />;
}
