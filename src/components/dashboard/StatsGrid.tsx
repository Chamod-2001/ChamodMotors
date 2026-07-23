import { getDashboardStats } from '@/lib/queries/dashboard';
import { StatCard } from '@/components/dashboard/StatCard';
import { formatLKR } from '@/lib/format';
import type { Translator } from '@/lib/i18n/server';
import { Bike, Car, BookMarked, CheckCircle2, TrendingUp, Wallet, CalendarCheck, Coins, Landmark } from 'lucide-react';

export async function StatsGrid({ isAdmin, t }: { isAdmin: boolean; t: Translator }) {
  const stats = await getDashboardStats();

  const now = new Date();
  const monthLabel = now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  const todayLabel = now.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      <StatCard label={t('available_bikes')} value={stats.availableBikeCount} icon={Bike} tone="blue" />
      <StatCard label={t('available_three_wheelers')} value={stats.availableThreeWheelerCount} icon={Car} tone="blue" />
      <StatCard label={t('reserved')} value={stats.reservedCount} icon={BookMarked} tone="amber" />
      {isAdmin && <StatCard label={t('sold')} value={stats.soldCount} icon={CheckCircle2} tone="green" />}
      {isAdmin && (
        <StatCard label={`${t('monthly_sales')} — ${monthLabel}`} value={stats.monthlySalesCount} icon={TrendingUp} tone="blue" />
      )}
      {isAdmin && (
        <StatCard
          label={`${t('monthly_profit')} — ${monthLabel}`}
          value={formatLKR(stats.monthlyProfit)}
          icon={Wallet}
          tone="green"
        />
      )}
      {isAdmin && (
        <StatCard
          label={`${t('todays_sales')} — ${todayLabel}`}
          value={stats.todaysSalesCount}
          icon={CalendarCheck}
          tone="slate"
        />
      )}
      {isAdmin && (
        <StatCard
          label={`${t('todays_profit')} — ${todayLabel}`}
          value={formatLKR(stats.todaysProfit)}
          icon={Coins}
          tone="green"
        />
      )}
      {isAdmin && <StatCard label={t('total_revenue')} value={formatLKR(stats.totalRevenue)} icon={Landmark} tone="blue" />}
    </div>
  );
}
