import { requireAdmin } from '@/lib/queries/session';
import { listEmployees, listOnlineEmployeeIds } from '@/lib/queries/employees';
import { getTranslator } from '@/lib/i18n/server';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { AddEmployeeForm } from '@/components/employees/AddEmployeeForm';
import { EmployeeActiveToggle } from '@/components/employees/EmployeeActiveToggle';
import { EmployeeAvatarPicker } from '@/components/employees/EmployeeAvatarPicker';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { UserPlus } from 'lucide-react';

export default async function EmployeesPage() {
  await requireAdmin();
  const [employees, onlineIds, t] = await Promise.all([listEmployees(), listOnlineEmployeeIds(), getTranslator()]);

  return (
    <AppShell title={t('employees')}>
      <div className="mx-auto max-w-2xl space-y-4 p-4">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t('employees')}</h1>

        <div>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            {t('staff_label')} ({employees.length})
          </h2>
          <div className="space-y-2">
            {employees.map((employee) => (
              <Card key={employee.id} className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <EmployeeAvatarPicker employeeId={employee.id} photoPath={employee.photo_path} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-semibold text-slate-900 dark:text-slate-100">{employee.full_name}</p>
                      {onlineIds.has(employee.id) && (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-600 dark:bg-green-950 dark:text-green-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> {t('online_now')}
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      @{employee.username}
                      {' · '}
                      <span className="capitalize">{employee.role === 'admin' ? t('admin_role') : t('sales_employee')}</span>
                      {' · '}
                      {employee.is_active ? t('active_label') : t('inactive_label')}
                    </p>
                  </div>
                </div>
                <EmployeeActiveToggle employeeId={employee.id} isActive={employee.is_active} />
              </Card>
            ))}
          </div>
        </div>

        <CollapsibleSection label={t('add_employee')} icon={<UserPlus size={16} />}>
          <Card>
            <AddEmployeeForm />
          </Card>
        </CollapsibleSection>
      </div>
    </AppShell>
  );
}
