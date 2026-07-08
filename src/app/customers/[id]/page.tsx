import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCustomer, getCustomerPurchaseHistory, listSellableVehicles } from '@/lib/queries/customers';
import { getCurrentEmployee } from '@/lib/queries/session';
import { listDocuments } from '@/lib/queries/documents';
import { listReminders } from '@/lib/queries/reminders';
import { getTranslator } from '@/lib/i18n/server';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AppShell } from '@/components/layout/AppShell';
import { DeleteCustomerButton } from '@/components/customers/DeleteCustomerButton';
import { PurchaseHistoryList } from '@/components/customers/PurchaseHistoryList';
import { RecordSaleSection } from '@/components/customers/RecordSaleSection';
import { DocumentUploadForm } from '@/components/documents/DocumentUploadForm';
import { DocumentList } from '@/components/documents/DocumentList';
import { ReminderList } from '@/components/calendar/ReminderList';
import { User, Pencil, Phone, MapPin, Briefcase } from 'lucide-react';

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [customer, history, sellableVehicles, employee, t] = await Promise.all([
    getCustomer(id),
    getCustomerPurchaseHistory(id),
    listSellableVehicles(),
    getCurrentEmployee(),
    getTranslator(),
  ]);
  if (!customer) notFound();
  const isAdmin = employee?.role === 'admin';
  const [documents, reminders] = await Promise.all([
    listDocuments({ customerId: customer.id }),
    listReminders({ customerId: customer.id }),
  ]);

  return (
    <AppShell title={t('customer_details')}>
    <div className="mx-auto max-w-2xl space-y-4 p-4">
      <div className="flex items-center justify-between gap-3">
        <Link href="/customers" className="text-sm font-medium text-brand">
          {t('back')}
        </Link>
        <div className="flex gap-2">
          <Link href={`/customers/${customer.id}/edit`}>
            <Button variant="secondary" className="!py-2 !px-4 !min-h-0">
              <Pencil size={16} /> {t('edit')}
            </Button>
          </Link>
          {isAdmin && <DeleteCustomerButton customerId={customer.id} />}
        </div>
      </div>

      <Card>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand">
            <User size={28} />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold text-slate-900">{customer.full_name}</h1>
            <p className="text-sm text-slate-500">{t('nic_label')}: {customer.nic_number}</p>
          </div>
        </div>

        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex items-center gap-2 text-slate-700">
            <Phone size={16} className="text-slate-400" /> {customer.phone_number}
          </div>
          {customer.address && (
            <div className="flex items-center gap-2 text-slate-700">
              <MapPin size={16} className="text-slate-400" /> {customer.address}
            </div>
          )}
          {customer.occupation && (
            <div className="flex items-center gap-2 text-slate-700">
              <Briefcase size={16} className="text-slate-400" /> {customer.occupation}
            </div>
          )}
        </dl>
      </Card>

      <RecordSaleSection customerId={customer.id} sellableVehicles={sellableVehicles} />

      <PurchaseHistoryList history={history} />

      {reminders.length > 0 && (
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">{t('reminders_label')}</h2>
          <ReminderList items={reminders} isAdmin={isAdmin} revalidatePaths={[`/customers/${customer.id}`, '/calendar']} />
        </Card>
      )}

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">{t('documents_label')}</h2>
        <DocumentUploadForm
          customerId={customer.id}
          vehicleOptions={history.map((h) => ({ id: h.vehicleId, label: h.vehicleLabel })).filter((v) => v.id)}
          revalidatePaths={[`/customers/${customer.id}`]}
        />
        <div className="mt-4">
          <DocumentList items={documents} isAdmin={isAdmin} revalidatePaths={[`/customers/${customer.id}`]} />
        </div>
      </Card>
    </div>
    </AppShell>
  );
}
