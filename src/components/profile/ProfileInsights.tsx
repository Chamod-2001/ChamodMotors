import { Eye, MapPin, Share2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { getTranslator } from '@/lib/i18n/server';
import type { ShopProfileViewStats } from '@/lib/queries/shopAnalytics';

const SOURCE_LABELS: Record<string, string> = {
  share: 'Share button',
  qr: 'QR code',
};

export async function ProfileInsights({ stats }: { stats: ShopProfileViewStats }) {
  const t = await getTranslator();
  const maxDaily = Math.max(1, ...stats.dailyCounts.map((d) => d.count));

  return (
    <Card>
      <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
        <Eye size={18} /> {t('profile_insights_label')}
      </h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-800/60">
          <p className="text-xs text-slate-400">{t('views_today')}</p>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{stats.todayViews}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-800/60">
          <p className="text-xs text-slate-400">{t('views_7_days')}</p>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{stats.last7DaysViews}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-800/60">
          <p className="text-xs text-slate-400">{t('views_30_days')}</p>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{stats.last30DaysViews}</p>
        </div>
        <div className="rounded-xl bg-brand-light p-3 text-center">
          <p className="text-xs text-brand-dark">{t('views_all_time')}</p>
          <p className="text-xl font-bold text-brand-dark">{stats.totalViews}</p>
        </div>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{t('views_last_14_days')}</p>
        <div className="flex items-end gap-1 h-20">
          {stats.dailyCounts.map((d) => (
            <div key={d.date} className="flex-1 flex flex-col items-center justify-end gap-1" title={`${d.date}: ${d.count}`}>
              <div
                className="w-full rounded-t bg-brand"
                style={{ height: `${Math.max(4, (d.count / maxDaily) * 100)}%` }}
              />
            </div>
          ))}
        </div>
      </div>

      {stats.topLocations.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <MapPin size={12} /> {t('top_locations_label')}
          </p>
          <ul className="space-y-1">
            {stats.topLocations.map((loc) => (
              <li key={loc.label} className="flex items-center justify-between text-sm">
                <span className="truncate text-slate-700 dark:text-slate-300">{loc.label}</span>
                <span className="shrink-0 font-semibold text-slate-500">{loc.count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {stats.topSources.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <Share2 size={12} /> {t('top_sources_label')}
          </p>
          <ul className="space-y-1">
            {stats.topSources.map((s) => (
              <li key={s.source} className="flex items-center justify-between text-sm">
                <span className="truncate text-slate-700 dark:text-slate-300">{SOURCE_LABELS[s.source] ?? s.source}</span>
                <span className="shrink-0 font-semibold text-slate-500">{s.count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {stats.totalViews === 0 && <p className="mt-3 text-center text-sm text-slate-400">{t('no_views_yet')}</p>}
    </Card>
  );
}
