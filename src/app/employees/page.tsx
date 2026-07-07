import { requireAdmin } from '@/lib/queries/session';
import { listEmployees } from '@/lib/queries/employees';
import { getTranslator } from '@/lib/i18n/server';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { AddEmployeeForm } from '@/components/employees/AddEmployeeForm';
import { EmployeeActiveToggle } from '@/components/employees/EmployeeActiveToggle';

export default async function EmployeesPage() {
  await requireAdmin();
  const employees = await listEmployees();
  const t = await getTranslator();

  return (
    <AppShell title={t('employees')}>
      <div className="mx-auto max-w-2xl space-y-4 p-4">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t('employees')}</h1>

        <Card>
          <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">{t('add_employee')}</h2>
          <AddEmployeeForm />
        </Card>

        <div>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            {t('staff_label')} ({employees.length})
          </h2>
          <div className="space-y-2">
            {employees.map((employee) => (
              <Card key={employee.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900 dark:text-slate-100">{employee.full_name}</p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    @{employee.username}
                    {' · '}
                    <span className="capitalize">{employee.role === 'admin' ? t('admin_role') : t('sales_employee')}</span>
                    {' · '}
                    {employee.is_active ? t('active_label') : t('inactive_label')}
                  </p>
                </div>
                <EmployeeActiveToggle employeeId={employee.id} isActive={employee.is_active} />
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
