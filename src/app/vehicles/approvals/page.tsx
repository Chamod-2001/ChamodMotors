import Link from 'next/link';
import { requireAdmin } from '@/lib/queries/session';
import { listPendingVehicleEditRequests } from '@/lib/queries/vehicleEditRequests';
import { getTranslator } from '@/lib/i18n/server';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { EditRequestDiff } from '@/components/vehicles/EditRequestDiff';
import { EditRequestActions } from '@/components/vehicles/EditRequestActions';

export default async function VehicleApprovalsPage() {
  await requireAdmin();
  const [requests, t] = await Promise.all([listPendingVehicleEditRequests(), getTranslator()]);

  return (
    <AppShell title={t('pending_approvals')}>
      <div className="mx-auto max-w-2xl space-y-4 p-4">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t('pending_approvals')}</h1>

        {requests.length === 0 ? (
          <Card>
            <p className="py-6 text-center text-sm text-slate-400">{t('no_pending_approvals')}</p>
          </Card>
        ) : (
          requests.map((request) => (
            <Card key={request.id}>
              <div className="mb-1 flex items-center justify-between gap-2">
                <Link href={`/vehicles/${request.vehicleId}`} className="font-semibold text-brand hover:underline">
                  {request.vehicleLabel}
                </Link>
                <span className="shrink-0 text-xs text-slate-400">
                  {new Date(request.createdAt).toLocaleDateString('en-LK', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              {request.requestedByName && (
                <p className="mb-3 text-xs text-slate-400">
                  {t('by_prefix')} {request.requestedByName}
                </p>
              )}

              <EditRequestDiff changes={request.changes} />

              <div className="mt-4">
                <EditRequestActions requestId={request.id} />
              </div>
            </Card>
          ))
        )}
      </div>
    </AppShell>
  );
}
