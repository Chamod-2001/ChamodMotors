import { getDashboardStats } from '@/lib/queries/dashboard';
import { StatCard } from '@/components/dashboard/StatCard';
import { formatLKR } from '@/lib/format';
import type { Translator } from '@/lib/i18n/server';
import {
  Bike,
  Car,
  BookMarked,
  CheckCircle2,
  TrendingUp,
  Wallet,
  CalendarCheck,
  Coins,
  Landmark,
  PiggyBank,
} from 'lucide-react';

function StatGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-4">{children}</div>
    </div>
  );
}

export async function StatsGrid({ isAdmin, t }: { isAdmin: boolean; t: Translator }) {
  const stats = await getDashboardStats();

  const now = new Date();
  const monthLabel = now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  const todayLabel = now.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });

  return (
    <div className="space-y-5">
      <StatGroup label={t('vehicles_section')}>
        <StatCard label={t('available_bikes')} value={stats.availableBikeCount} icon={Bike} tone="blue" />
        <StatCard label={t('available_three_wheelers')} value={stats.availableThreeWheelerCount} icon={Car} tone="blue" />
        <StatCard label={t('reserved')} value={stats.reservedCount} icon={BookMarked} tone="amber" />
        {isAdmin && <StatCard label={t('sold')} value={stats.soldCount} icon={CheckCircle2} tone="green" />}
      </StatGroup>

      {isAdmin && (
        <StatGroup label={`${t('today_section')} — ${todayLabel}`}>
          <StatCard label={t('todays_sales')} value={stats.todaysSalesCount} icon={CalendarCheck} tone="slate" />
          <StatCard label={t('todays_profit')} value={formatLKR(stats.todaysProfit)} icon={Coins} tone="green" />
        </StatGroup>
      )}

      {isAdmin && (
        <StatGroup label={`${t('this_month_section')} — ${monthLabel}`}>
          <StatCard label={t('monthly_sales')} value={stats.monthlySalesCount} icon={TrendingUp} tone="blue" />
          <StatCard label={t('monthly_profit')} value={formatLKR(stats.monthlyProfit)} icon={Wallet} tone="green" />
        </StatGroup>
      )}

      {isAdmin && (
        <StatGroup label={t('all_time_section')}>
          <StatCard label={t('total_revenue')} value={formatLKR(stats.totalRevenue)} icon={Landmark} tone="blue" />
          <StatCard label={t('total_gross_profit')} value={formatLKR(stats.totalProfit)} icon={PiggyBank} tone="green" />
        </StatGroup>
      )}
    </div>
  );
}
