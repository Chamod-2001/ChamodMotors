import Link from 'next/link';
import { searchAll } from '@/lib/queries/search';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { LiveSearchInput } from '@/components/ui/LiveSearchInput';
import { VehicleStatusBadge } from '@/components/vehicles/VehicleStatusBadge';
import { getTranslator } from '@/lib/i18n/server';
import { Bike, User, SearchIcon } from 'lucide-react';
import type { VehicleStatus } from '../../../types/database.types';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? '';
  const results = query ? await searchAll(query) : { vehicles: [], customers: [] };
  const hasResults = results.vehicles.length > 0 || results.customers.length > 0;
  const t = await getTranslator();

  return (
    <AppShell title={t('search')}>
      <div className="mx-auto max-w-2xl space-y-4 p-4">
        <h1 className="text-xl font-bold text-slate-900">{t('search')}</h1>

        <LiveSearchInput placeholder={t('search_global_placeholder')} autoFocus />

        {!query ? (
          <div className="flex flex-col items-center gap-2 py-16 text-slate-400">
            <SearchIcon size={32} />
            <p>{t('search_hint')}</p>
          </div>
        ) : !hasResults ? (
          <p className="py-16 text-center text-slate-400">
            {t('no_results_message').replace('{{query}}', query)}
          </p>
        ) : (
          <>
            {results.vehicles.length > 0 && (
              <div>
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">{t('vehicles')}</h2>
                <div className="space-y-2">
                  {results.vehicles.map((v) => (
                    <Link key={v.id} href={`/vehicles/${v.id}`}>
                      <Card className="flex items-center gap-3 transition hover:shadow-md active:scale-[0.99]">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand">
                          <Bike size={20} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-slate-900">{v.label}</p>
                          <p className="truncate text-sm text-slate-500">{v.registration_number ?? '—'}</p>
                        </div>
                        <VehicleStatusBadge status={v.status as VehicleStatus} />
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {results.customers.length > 0 && (
              <div>
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">{t('customers')}</h2>
                <div className="space-y-2">
                  {results.customers.map((c) => (
                    <Link key={c.id} href={`/customers/${c.id}`}>
                      <Card className="flex items-center gap-3 transition hover:shadow-md active:scale-[0.99]">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-50 text-purple-600">
                          <User size={20} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-slate-900">{c.full_name}</p>
                          <p className="truncate text-sm text-slate-500">{c.phone_number}</p>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
