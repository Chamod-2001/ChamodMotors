import Link from 'next/link';
import { listVehicles } from '@/lib/queries/vehicles';
import { VehicleCard } from '@/components/vehicles/VehicleCard';
import { Button } from '@/components/ui/Button';
import { LiveSearchInput } from '@/components/ui/LiveSearchInput';
import { AppShell } from '@/components/layout/AppShell';
import { getCurrentEmployee } from '@/lib/queries/session';
import { getTranslator } from '@/lib/i18n/server';
import { PlusCircle } from 'lucide-react';
import type { VehicleStatus } from '../../../types/database.types';

export default async function VehiclesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const params = await searchParams;
  const status = (params.status as VehicleStatus | undefined) || undefined;
  const query = params.q || undefined;

  const employee = await getCurrentEmployee();
  const isAdmin = employee?.role === 'admin';
  const vehicles = await listVehicles({ status, query });
  const t = await getTranslator();

  const tabs: { label: string; value: VehicleStatus | undefined }[] = [
    { label: t('all'), value: undefined },
    { label: t('available'), value: 'available' },
    { label: t('reserved'), value: 'reserved' },
    { label: t('sold'), value: 'sold' },
  ];

  return (
    <AppShell title={t('vehicles')}>
      <div className="mx-auto space-y-4 p-4" style={{ maxWidth: '56rem' }}>
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-slate-900">{t('vehicles')}</h1>
          {isAdmin && (
            <Link href="/vehicles/new">
              <Button className="!py-2 !px-4 !min-h-0">
                <PlusCircle size={18} /> {t('add')}
              </Button>
            </Link>
          )}
        </div>

        <LiveSearchInput placeholder={t('search_vehicles_placeholder')} />

        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <Link
              key={tab.label}
              href={{ pathname: '/vehicles', query: { ...(tab.value ? { status: tab.value } : {}), ...(query ? { q: query } : {}) } }}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
                status === tab.value ? 'bg-brand text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <div className="space-y-3">
          {vehicles.length === 0 ? (
            <p className="py-10 text-center text-slate-400">{t('no_vehicles_found')}</p>
          ) : (
            vehicles.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)
          )}
        </div>
      </div>
    </AppShell>
  );
}
