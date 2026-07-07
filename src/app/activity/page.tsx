import { requireAdmin } from '@/lib/queries/session';
import { listActivityGroupedByEmployee } from '@/lib/queries/activity';
import { getTranslator } from '@/lib/i18n/server';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { MarkActivityReadOnMount } from '@/components/activity/MarkActivityReadOnMount';
import { LogIn, LogOut, Bike, CheckCircle2, UserPlus, MessageCircle, type LucideIcon } from 'lucide-react';
import type { ActivityType } from '../../../types/database.types';
import type { TranslationKey } from '@/lib/i18n/translations';

const ACTIVITY_ICONS: Record<ActivityType, LucideIcon> = {
  login: LogIn,
  logout: LogOut,
  vehicle_created: Bike,
  vehicle_sold: CheckCircle2,
  customer_created: UserPlus,
  finance_contact: MessageCircle,
};

const ACTIVITY_LABEL_KEYS: Record<ActivityType, TranslationKey> = {
  login: 'activity_logged_in',
  logout: 'activity_logged_out',
  vehicle_created: 'activity_added_vehicle',
  vehicle_sold: 'activity_marked_vehicle_sold',
  customer_created: 'activity_added_customer',
  finance_contact: 'activity_contacted_finance_officer',
};

function formatTime(value: string) {
  return new Date(value).toLocaleString('en-LK', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function ActivityPage() {
  await requireAdmin();
  const groups = await listActivityGroupedByEmployee();
  const t = await getTranslator();

  return (
    <AppShell title={t('activity')}>
      <MarkActivityReadOnMount />
      <div className="mx-auto max-w-2xl space-y-4 p-4">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t('activity')}</h1>

        {groups.length === 0 ? (
          <Card>
            <p className="py-6 text-center text-slate-400">{t('no_activity_recorded_yet')}</p>
          </Card>
        ) : (
          groups.map((group) => (
            <div key={group.employeeId}>
              <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                {group.employeeName}
                <span className="normal-case text-slate-400">@{group.username}</span>
                <span
                  className={
                    group.role === 'admin'
                      ? 'rounded-full bg-brand-light px-2 py-0.5 text-[10px] font-bold normal-case text-brand-dark dark:text-brand'
                      : 'rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold normal-case text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }
                >
                  {group.role === 'admin' ? t('admin_role') : t('sales_employee')}
                </span>
              </h2>

              <div className="space-y-3">
                {group.sessions.map((session, index) => (
                  <Card key={index}>
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-500 dark:text-slate-400">
                        {session.loginAt ? formatTime(session.loginAt) : t('before_tracking_began')}
                        {session.logoutAt ? ` → ${formatTime(session.logoutAt)}` : ''}
                      </span>
                      {session.ongoing && (
                        <span className="rounded-full bg-green-50 px-2 py-0.5 font-semibold text-green-600">
                          {t('ongoing')}
                        </span>
                      )}
                    </div>

                    <ul className="space-y-2 border-l-2 border-slate-100 pl-3 dark:border-slate-800">
                      {session.items.map((item) => {
                        const Icon = ACTIVITY_ICONS[item.activityType];
                        return (
                          <li key={item.id} className="flex items-center gap-2">
                            <Icon size={14} className="shrink-0 text-brand" />
                            <div className="min-w-0 flex-1">
                              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                {t(ACTIVITY_LABEL_KEYS[item.activityType])}
                              </span>
                              {item.description && (
                                <span className="text-sm text-slate-500 dark:text-slate-400"> — {item.description}</span>
                              )}
                            </div>
                            <span className="shrink-0 text-xs text-slate-400">
                              {new Date(item.createdAt).toLocaleTimeString('en-LK', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </AppShell>
  );
}
