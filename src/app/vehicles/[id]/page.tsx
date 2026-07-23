import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getVehicle, getVehicleSaleInfo } from '@/lib/queries/vehicles';
import { getVehicleImagePublicUrl } from '@/lib/storageUrls';
import { getCurrentEmployee } from '@/lib/queries/session';
import { listDocuments } from '@/lib/queries/documents';
import { listReminders } from '@/lib/queries/reminders';
import { listVehicleExpenses } from '@/lib/queries/vehicleExpenses';
import { getPendingRequestForVehicle } from '@/lib/queries/vehicleEditRequests';
import { formatLKR } from '@/lib/format';
import { getTranslator } from '@/lib/i18n/server';
import { VehicleStatusBadge } from '@/components/vehicles/VehicleStatusBadge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AppShell } from '@/components/layout/AppShell';
import { VehicleStatusControls } from '@/components/vehicles/VehicleStatusControls';
import { DeleteVehicleButton } from '@/components/vehicles/DeleteVehicleButton';
import { DocumentList } from '@/components/documents/DocumentList';
import { ReminderList } from '@/components/calendar/ReminderList';
import { VehicleExpenseList } from '@/components/vehicles/VehicleExpenseList';
import { VehicleExpenseForm } from '@/components/vehicles/VehicleExpenseForm';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { Bike, Pencil, PlusCircle } from 'lucide-react';
import type { TranslationKey } from '@/lib/i18n/translations';

const SPEC_LABEL_KEYS: Record<string, TranslationKey> = {
  vehicle_type: 'vehicle_type',
  registration_number: 'registration_number',
  engine_number: 'engine_number',
  chassis_number: 'chassis_number',
  mileage: 'mileage',
  fuel_type: 'fuel_type',
  color: 'color',
};

export default async function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [vehicle, employee, t] = await Promise.all([getVehicle(id), getCurrentEmployee(), getTranslator()]);
  if (!vehicle) notFound();
  const isAdmin = employee?.role === 'admin';
  const [documents, reminders, pendingRequest, saleInfo, expenses] = await Promise.all([
    listDocuments({ vehicleId: vehicle.id }),
    listReminders({ vehicleId: vehicle.id }),
    getPendingRequestForVehicle(vehicle.id),
    vehicle.status === 'sold' ? getVehicleSaleInfo(vehicle.id) : Promise.resolve(null),
    listVehicleExpenses(vehicle.id),
  ]);

  const sellerDocs = documents.filter((d) => d.partyRole === 'seller');
  const buyerDocs = documents.filter((d) => d.partyRole === 'buyer');
  const otherDocs = documents.filter((d) => !d.partyRole);
  const hasSellerInfo = vehicle.seller_name || vehicle.seller_nic_number || vehicle.seller_phone_number;

  const specs: [string, string][] = [
    ['vehicle_type', vehicle.vehicle_type],
    ['registration_number', vehicle.registration_number ?? '—'],
    ['engine_number', vehicle.engine_number ?? '—'],
    ['chassis_number', vehicle.chassis_number ?? '—'],
    ['mileage', vehicle.mileage != null ? `${vehicle.mileage} km` : '—'],
    ['fuel_type', vehicle.fuel_type ?? '—'],
    ['color', vehicle.color ?? '—'],
  ];

  return (
    <AppShell title={t('vehicle_details')}>
    <div className="mx-auto max-w-2xl space-y-4 p-4">
      <div className="flex items-center justify-between gap-3">
        <Link href="/vehicles" className="text-sm font-medium text-brand">
          {t('back')}
        </Link>
        <div className="flex gap-2">
          <Link href={`/vehicles/${vehicle.id}/edit`}>
            <Button variant="secondary" className="!py-2 !px-4 !min-h-0">
              <Pencil size={16} /> {t('edit')}
            </Button>
          </Link>
          {isAdmin && <DeleteVehicleButton vehicleId={vehicle.id} />}
        </div>
      </div>

      {!isAdmin && pendingRequest && (
        <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p className="font-semibold">{t('edit_request_pending_title')}</p>
          <p className="mt-1">{t('edit_request_pending_message')}</p>
        </div>
      )}

      {/* Photo gallery */}
      {vehicle.images.length > 0 ? (
        <div className="flex w-full min-w-0 gap-2 overflow-x-auto">
          {vehicle.images.map((img) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={img.id}
              src={getVehicleImagePublicUrl(img.storage_path)}
              alt=""
              className="h-48 w-64 shrink-0 rounded-xl object-cover"
            />
          ))}
        </div>
      ) : (
        <div className="flex h-48 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
          <Bike size={40} />
        </div>
      )}

      <Card>
        <div className="mb-3 flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {vehicle.brand} {vehicle.model} {vehicle.manufacturing_year ? `(${vehicle.manufacturing_year})` : ''}
            </h1>
          </div>
          <VehicleStatusBadge status={vehicle.status} />
        </div>

        <VehicleStatusControls vehicleId={vehicle.id} currentStatus={vehicle.status} />

        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          {specs.map(([key, value]) => (
            <div key={key}>
              <dt className="text-slate-400">{t(SPEC_LABEL_KEYS[key])}</dt>
              <dd className="font-medium capitalize text-slate-800">{value.toString().replace('_', ' ')}</dd>
            </div>
          ))}
        </dl>
      </Card>

      {isAdmin ? (
        <Card className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
          <div>
            <p className="text-xs text-slate-400">{t('buying_price')}</p>
            <p className="text-sm font-bold text-slate-900 sm:text-base">{formatLKR(vehicle.buying_price)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">{t('total_expenses_label')}</p>
            <p className="text-sm font-bold text-slate-900 sm:text-base">{formatLKR(vehicle.total_expenses)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">{t('selling_price')}</p>
            <p className="text-sm font-bold text-slate-900 sm:text-base">{formatLKR(vehicle.selling_price)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">{t('gross_profit')}</p>
            <p className="text-sm font-bold text-green-600 sm:text-base">{formatLKR(vehicle.gross_profit)}</p>
          </div>
        </Card>
      ) : (
        <Card className="text-center">
          <p className="text-xs text-slate-400">{t('selling_price')}</p>
          <p className="text-xl font-bold text-slate-900">{formatLKR(vehicle.selling_price)}</p>
        </Card>
      )}

      <Card className="grid grid-cols-3 gap-2 text-center sm:gap-3">
        <div>
          <p className="text-xs text-slate-400">{t('buying_date')}</p>
          <p className="text-sm font-semibold text-slate-800">
            {new Date(vehicle.buying_date).toLocaleDateString('en-LK', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400">{t('reserved_date')}</p>
          <p className="text-sm font-semibold text-slate-800">
            {vehicle.reserved_at
              ? new Date(vehicle.reserved_at).toLocaleDateString('en-LK', { day: '2-digit', month: 'short', year: 'numeric' })
              : '—'}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400">{t('sold_date')}</p>
          <p className="text-sm font-semibold text-slate-800">
            {vehicle.sold_at
              ? new Date(vehicle.sold_at).toLocaleDateString('en-LK', { day: '2-digit', month: 'short', year: 'numeric' })
              : '—'}
          </p>
        </div>
      </Card>

      {isAdmin && hasSellerInfo && (
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">{t('purchased_from_label')}</h2>
          <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs text-slate-400">{t('seller_name_label')}</dt>
              <dd className="font-medium text-slate-800">{vehicle.seller_name || t('not_provided')}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">{t('seller_nic_label')}</dt>
              <dd className="font-medium text-slate-800">{vehicle.seller_nic_number || t('not_provided')}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">{t('seller_phone_label')}</dt>
              <dd className="font-medium text-slate-800">{vehicle.seller_phone_number || t('not_provided')}</dd>
            </div>
          </dl>

          <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/60">
            <p className="text-xs text-slate-400">{t('buying_price')} (LKR)</p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{formatLKR(vehicle.buying_price)}</p>
          </div>

          {sellerDocs.length > 0 && (
            <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {t('seller_documents_section')}
              </p>
              <DocumentList items={sellerDocs} isAdmin={false} revalidatePaths={[`/vehicles/${vehicle.id}`]} />
            </div>
          )}
        </Card>
      )}

      {isAdmin && saleInfo && (
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">{t('sold_to_label')}</h2>
          <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs text-slate-400">{t('customer')}</dt>
              <dd className="font-medium text-slate-800">{saleInfo.customerName}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">{t('nic_label')}</dt>
              <dd className="font-medium text-slate-800">{saleInfo.customerNic}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">{t('phone_number')}</dt>
              <dd className="font-medium text-slate-800">{saleInfo.customerPhone}</dd>
            </div>
          </dl>

          <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/60">
            <p className="text-xs text-slate-400">{t('sale_price')} (LKR)</p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{formatLKR(saleInfo.salePrice)}</p>
            {saleInfo.soldByName && (
              <p className="mt-1 text-xs text-slate-400">
                {t('sold_by_prefix')} {saleInfo.soldByName}
              </p>
            )}
          </div>

          {buyerDocs.length > 0 && (
            <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {t('buyer_documents_section')}
              </p>
              <DocumentList items={buyerDocs} isAdmin={false} revalidatePaths={[`/vehicles/${vehicle.id}`]} />
            </div>
          )}
        </Card>
      )}

      {isAdmin && (
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
            {t('reconditioning_expenses_label')}
          </h2>
          <VehicleExpenseList items={expenses} vehicleId={vehicle.id} />
          <div className="mt-4">
            <CollapsibleSection label={t('add_expense')} icon={<PlusCircle size={16} />}>
              <VehicleExpenseForm vehicleId={vehicle.id} />
            </CollapsibleSection>
          </div>
        </Card>
      )}

      {vehicle.notes && (
        <Card>
          <p className="mb-1 text-xs text-slate-400">{t('notes')}</p>
          <p className="text-slate-700">{vehicle.notes}</p>
        </Card>
      )}

      {reminders.length > 0 && (
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">{t('reminders_label')}</h2>
          <ReminderList items={reminders} isAdmin={isAdmin} revalidatePaths={[`/vehicles/${vehicle.id}`, '/calendar']} />
        </Card>
      )}

      {otherDocs.length > 0 && (
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">{t('documents_label')}</h2>
          <DocumentList items={otherDocs} isAdmin={false} revalidatePaths={[`/vehicles/${vehicle.id}`]} />
        </Card>
      )}
    </div>
    </AppShell>
  );
}
