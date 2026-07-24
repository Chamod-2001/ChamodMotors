import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getFinanceOfficer,
  listFinanceCommunications,
  listCustomersForFinancePicker,
  listVehiclesForFinancePicker,
} from '@/lib/queries/finance';
import { getCurrentEmployee } from '@/lib/queries/session';
import { listReminders } from '@/lib/queries/reminders';
import { getFinancePhotoPublicUrl } from '@/lib/storageUrls';
import { getTranslator } from '@/lib/i18n/server';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ZoomableImage } from '@/components/ui/ZoomableImage';
import { AppShell } from '@/components/layout/AppShell';
import { WhatsAppQuickActions } from '@/components/finance/WhatsAppQuickActions';
import { CallOfficerButton } from '@/components/finance/CallOfficerButton';
import { CommunicationLogForm } from '@/components/finance/CommunicationLogForm';
import { CommunicationLogList } from '@/components/finance/CommunicationLogList';
import { DeleteFinanceOfficerButton } from '@/components/finance/DeleteFinanceOfficerButton';
import { ReminderList } from '@/components/calendar/ReminderList';
import { Pencil, Building2, User } from 'lucide-react';

export default async function FinanceOfficerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [officer, communications, customers, vehicles, reminders, employee, t] = await Promise.all([
    getFinanceOfficer(id),
    listFinanceCommunications(id),
    listCustomersForFinancePicker(),
    listVehiclesForFinancePicker(),
    listReminders({ financeOfficerId: id }),
    getCurrentEmployee(),
    getTranslator(),
  ]);
  if (!officer) notFound();
  const isAdmin = employee?.role === 'admin';

  const hasContact = Boolean(officer.whatsapp_number || officer.phone_number);

  return (
    <AppShell title={t('finance_officer')}>
    <div className="mx-auto max-w-2xl space-y-4 p-4">
      <div className="flex items-center justify-between gap-3">
        <Link href="/finance" className="text-sm font-medium text-brand">
          {t('back')}
        </Link>
        <div className="flex gap-2">
          {isAdmin && (
            <Link href={`/finance/${officer.id}/edit`}>
              <Button variant="secondary" className="!py-2 !px-4 !min-h-0">
                <Pencil size={16} /> {t('edit')}
              </Button>
            </Link>
          )}
          {isAdmin && <DeleteFinanceOfficerButton officerId={officer.id} />}
        </div>
      </div>

      <Card>
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
            <ZoomableImage
              src={officer.photo_path ? getFinancePhotoPublicUrl(officer.photo_path) : null}
              className="h-full w-full object-cover"
              fallback={<User size={26} />}
            />
          </div>
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-1.5 text-sm text-slate-500">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded bg-slate-100 text-slate-400 dark:bg-slate-800">
                <ZoomableImage
                  src={officer.finance_company_logo_path ? getFinancePhotoPublicUrl(officer.finance_company_logo_path) : null}
                  className="h-full w-full object-contain"
                  fallback={<Building2 size={12} />}
                />
              </div>
              {officer.finance_company_name}
            </div>
            <h1 className="truncate text-xl font-bold text-slate-900">{officer.officer_name}</h1>
            {isAdmin && <p className="text-sm text-slate-500">{officer.phone_number ?? '—'}</p>}
          </div>
        </div>
        {officer.notes && <p className="mt-2 text-sm text-slate-600">{officer.notes}</p>}
      </Card>

      {hasContact ? (
        <Card>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">WhatsApp</h2>
          <WhatsAppQuickActions officerId={officer.id} />
          {officer.phone_number && (
            <div className="mt-2">
              <CallOfficerButton officerId={officer.id} />
            </div>
          )}
        </Card>
      ) : (
        <Card>
          <p className="text-sm text-slate-400">{t('no_officer_contact')}</p>
        </Card>
      )}

      {reminders.length > 0 && (
        <Card>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">{t('reminders_label')}</h2>
          <ReminderList items={reminders} isAdmin={isAdmin} revalidatePaths={[`/finance/${officer.id}`, '/calendar']} />
        </Card>
      )}

      <Card>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">{t('add_note')}</h2>
        <CommunicationLogForm officerId={officer.id} customers={customers} vehicles={vehicles} />
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">{t('communication_history')}</h2>
        <CommunicationLogList items={communications} />
      </Card>
    </div>
    </AppShell>
  );
}
