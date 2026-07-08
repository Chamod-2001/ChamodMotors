import { getCurrentEmployee } from '@/lib/queries/session';
import { listUpcomingReminders } from '@/lib/queries/reminders';
import { listVehiclesForFinancePicker, listCustomersForFinancePicker, listFinanceOfficersForPicker } from '@/lib/queries/finance';
import { getTranslator } from '@/lib/i18n/server';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { CalendarBoard } from '@/components/calendar/CalendarBoard';
import { ReminderList } from '@/components/calendar/ReminderList';

export default async function CalendarPage() {
  const [employee, reminders, vehicles, customers, officers, t] = await Promise.all([
    getCurrentEmployee(),
    listUpcomingReminders(),
    listVehiclesForFinancePicker(),
    listCustomersForFinancePicker(),
    listFinanceOfficersForPicker(),
    getTranslator(),
  ]);
  const isAdmin = employee?.role === 'admin';

  return (
    <AppShell title={t('calendar')}>
      <div className="mx-auto max-w-2xl space-y-4 p-4">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t('calendar')}</h1>

        <Card>
          <CalendarBoard reminders={reminders} vehicles={vehicles} customers={customers} officers={officers} />
        </Card>

        <div>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">{t('upcoming_reminders')}</h2>
          <Card>
            <ReminderList items={reminders} isAdmin={isAdmin} revalidatePaths={['/calendar']} />
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
