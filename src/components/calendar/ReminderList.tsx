import { getTranslator } from '@/lib/i18n/server';
import { ReminderActions } from '@/components/calendar/ReminderActions';
import type { ReminderItem } from '@/lib/queries/reminders';

function dueBadge(dueAt: string, t: (key: 'overdue_label' | 'due_today_label') => string) {
  const due = new Date(dueAt);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  if (due < startOfToday) {
    return (
      <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600 dark:bg-red-950 dark:text-red-400">
        {t('overdue_label')}
      </span>
    );
  }
  if (due < startOfTomorrow) {
    return (
      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:bg-amber-950 dark:text-amber-400">
        {t('due_today_label')}
      </span>
    );
  }
  return null;
}

export async function ReminderList({
  items,
  isAdmin,
  revalidatePaths,
}: {
  items: ReminderItem[];
  isAdmin: boolean;
  revalidatePaths: string[];
}) {
  const t = await getTranslator();

  if (items.length === 0) {
    return <p className="py-6 text-center text-sm text-slate-400">{t('no_reminders_yet')}</p>;
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-slate-800 dark:text-slate-100">{item.title}</p>
                {dueBadge(item.dueAt, t)}
              </div>
              <p className="text-xs text-slate-400">
                {new Date(item.dueAt).toLocaleString('en-LK', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              {item.note && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{item.note}</p>}
              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
                {item.createdByName && <span>{t('by_prefix')} {item.createdByName}</span>}
                {item.customerName && (
                  <span className="rounded-full bg-brand-light px-2 py-0.5 text-brand-dark">{item.customerName}</span>
                )}
                {item.vehicleLabel && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700">{item.vehicleLabel}</span>
                )}
                {item.officerName && (
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                    {item.officerName}
                  </span>
                )}
              </div>
            </div>
            <ReminderActions reminderId={item.id} isAdmin={isAdmin} revalidatePaths={revalidatePaths} />
          </div>
        </li>
      ))}
    </ul>
  );
}
