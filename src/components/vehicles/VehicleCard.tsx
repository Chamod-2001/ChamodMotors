import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { VehicleStatusBadge } from './VehicleStatusBadge';
import { getVehicleImagePublicUrl } from '@/lib/storageUrls';
import { formatLKR } from '@/lib/format';
import { getTranslator, type Translator } from '@/lib/i18n/server';
import type { VehicleListItem } from '@/lib/queries/vehicles';
import { Bike } from 'lucide-react';

function statusDateLabel(vehicle: VehicleListItem, t: Translator) {
  const dateStr = (d: string) => new Date(d).toLocaleDateString('en-LK', { day: '2-digit', month: 'short' });
  if (vehicle.status === 'sold' && vehicle.sold_at) {
    return `${t('sold')} ${dateStr(vehicle.sold_at)}`;
  }
  if (vehicle.status === 'reserved' && vehicle.reserved_at) {
    return `${t('reserved')} ${dateStr(vehicle.reserved_at)}`;
  }
  return `${t('bought')} ${dateStr(vehicle.buying_date)}`;
}

export async function VehicleCard({ vehicle }: { vehicle: VehicleListItem }) {
  const t = await getTranslator();

  return (
    <Link href={`/vehicles/${vehicle.id}`}>
      <Card className="flex items-center gap-4 transition hover:shadow-md active:scale-[0.99]">
        <div className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
          {vehicle.primary_image_path ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={getVehicleImagePublicUrl(vehicle.primary_image_path)}
              alt={`${vehicle.brand} ${vehicle.model}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <Bike className="text-slate-400" size={28} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-slate-900">
            {vehicle.brand} {vehicle.model} {vehicle.manufacturing_year ? `(${vehicle.manufacturing_year})` : ''}
          </p>
          <p className="truncate text-sm text-slate-500">{vehicle.registration_number ?? t('no_reg_number')}</p>
        </div>

        <div className="shrink-0 text-right">
          <p className="font-bold text-slate-900">{formatLKR(vehicle.selling_price)}</p>
          <div className="mt-1">
            <VehicleStatusBadge status={vehicle.status} />
          </div>
          <p className="mt-1 text-xs text-slate-400">{statusDateLabel(vehicle, t)}</p>
        </div>
      </Card>
    </Link>
  );
}
