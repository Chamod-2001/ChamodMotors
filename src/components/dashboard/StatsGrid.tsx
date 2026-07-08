import { getDashboardStats } from '@/lib/queries/dashboard';
import { StatCard } from '@/components/dashboard/StatCard';
import { formatLKR } from '@/lib/format';
import type { Translator } from '@/lib/i18n/server';
import { Bike, BookMarked, CheckCircle2, TrendingUp, Wallet, CalendarCheck, Coins } from 'lucide-react';

export async function StatsGrid({ isAdmin, t }: { isAdmin: boolean; t: Translator }) {
  const stats = await getDashboardStats();

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      <StatCard label={t('available')} value={stats.availableCount} icon={Bike} tone="blue" />
      <StatCard label={t('reserved')} value={stats.reservedCount} icon={BookMarked} tone="amber" />
      {isAdmin && <StatCard label={t('sold')} value={stats.soldCount} icon={CheckCircle2} tone="green" />}
      {isAdmin && <StatCard label={t('monthly_sales')} value={stats.monthlySalesCount} icon={TrendingUp} tone="blue" />}
      {isAdmin && <StatCard label={t('monthly_profit')} value={formatLKR(stats.monthlyProfit)} icon={Wallet} tone="green" />}
      {isAdmin && <StatCard label={t('todays_sales')} value={stats.todaysSalesCount} icon={CalendarCheck} tone="slate" />}
      {isAdmin && <StatCard label={t('todays_profit')} value={formatLKR(stats.todaysProfit)} icon={Coins} tone="green" />}
    </div>
  );
}
