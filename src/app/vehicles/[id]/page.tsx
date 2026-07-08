import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getVehicle } from '@/lib/queries/vehicles';
import { getVehicleImagePublicUrl } from '@/lib/storageUrls';
import { getCurrentEmployee } from '@/lib/queries/session';
import { listDocuments } from '@/lib/queries/documents';
import { listReminders } from '@/lib/queries/reminders';
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
import { Bike, Pencil } from 'lucide-react';
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
  const [documents, reminders, pendingRequest] = await Promise.all([
    listDocuments({ vehicleId: vehicle.id }),
    listReminders({ vehicleId: vehicle.id }),
    getPendingRequestForVehicle(vehicle.id),
  ]);

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
        <Card className="grid grid-cols-3 gap-2 text-center sm:gap-3">
          <div>
            <p className="text-xs text-slate-400">{t('buying_price')}</p>
            <p className="text-sm font-bold text-slate-900 sm:text-base">{formatLKR(vehicle.buying_price)}</p>
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

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">{t('documents_label')}</h2>
        <DocumentList items={documents} isAdmin={false} revalidatePaths={[`/vehicles/${vehicle.id}`]} />
      </Card>
    </div>
    </AppShell>
  );
}
