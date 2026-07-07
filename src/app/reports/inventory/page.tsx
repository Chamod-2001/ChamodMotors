import Link from 'next/link';
import { getInventoryReport } from '@/lib/queries/reports';
import { Card } from '@/components/ui/Card';
import { AppShell } from '@/components/layout/AppShell';
import { formatLKR } from '@/lib/format';
import { requireAdmin } from '@/lib/queries/session';
import { getTranslator } from '@/lib/i18n/server';
import type { TranslationKey } from '@/lib/i18n/translations';

const STATUS_LABEL_KEYS: Record<string, TranslationKey> = {
  available: 'available',
  reserved: 'reserved',
  sold: 'sold',
};

const STATUS_TONES: Record<string, string> = {
  available: 'text-brand',
  reserved: 'text-amber-600',
  sold: 'text-green-600',
};

export default async function InventoryReportPage() {
  await requireAdmin();
  const summary = await getInventoryReport();
  const totalCount = summary.reduce((s, r) => s + r.count, 0);
  const totalSellingValue = summary.reduce((s, r) => s + r.totalSellingValue, 0);
  const t = await getTranslator();

  return (
    <AppShell title={t('vehicle_inventory_report')}>
    <div className="mx-auto max-w-2xl space-y-4 p-4">
      <Link href="/reports" className="text-sm font-medium text-brand">
        {t('back')}
      </Link>
      <h1 className="text-xl font-bold text-slate-900">{t('vehicle_inventory_report')}</h1>

      <div className="grid grid-cols-2 gap-3">
        <Card className="text-center">
          <p className="text-sm text-slate-500">{t('total_vehicles')}</p>
          <p className="text-2xl font-bold text-slate-900">{totalCount}</p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-slate-500">{t('total_selling_value')}</p>
          <p className="text-2xl font-bold text-brand">{formatLKR(totalSellingValue)}</p>
        </Card>
      </div>

      {summary.map((row) => (
        <Card key={row.status}>
          <div className="mb-2 flex items-center justify-between">
            <h2 className={`text-lg font-semibold ${STATUS_TONES[row.status]}`}>{t(STATUS_LABEL_KEYS[row.status])}</h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
              {row.count} {t('vehicle_count_suffix')}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-slate-400">{t('total_buying_value')}</p>
              <p className="font-semibold text-slate-800">{formatLKR(row.totalBuyingValue)}</p>
            </div>
            <div>
              <p className="text-slate-400">{t('total_selling_value')}</p>
              <p className="font-semibold text-slate-800">{formatLKR(row.totalSellingValue)}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
    </AppShell>
  );
}
