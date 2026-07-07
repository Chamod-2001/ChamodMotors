import { redirect } from 'next/navigation';
import { getCurrentEmployee } from '@/lib/queries/session';
import { getDashboardStats, getRecentSales, getEmployeePerformance } from '@/lib/queries/dashboard';
import { AppShell } from '@/components/layout/AppShell';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentSalesList } from '@/components/dashboard/RecentSalesList';
import { EmployeePerformanceList } from '@/components/dashboard/EmployeePerformanceList';
import { formatLKR } from '@/lib/format';
import { getTranslator } from '@/lib/i18n/server';
import { Bike, BookMarked, CheckCircle2, TrendingUp, Wallet, CalendarCheck, Coins } from 'lucide-react';

export default async function DashboardPage() {
  const [employee, stats, recentSales, employeePerformance, t] = await Promise.all([
    getCurrentEmployee(),
    getDashboardStats(),
    getRecentSales(5),
    getEmployeePerformance(),
    getTranslator(),
  ]);

  if (!employee) redirect('/login');
  const isAdmin = employee.role === 'admin';

  return (
    <AppShell title={t('dashboard')}>
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <StatCard label={t('available')} value={stats.availableCount} icon={Bike} tone="blue" />
          <StatCard label={t('reserved')} value={stats.reservedCount} icon={BookMarked} tone="amber" />
          {isAdmin && <StatCard label={t('sold')} value={stats.soldCount} icon={CheckCircle2} tone="green" />}
          {isAdmin && (
            <StatCard label={t('monthly_sales')} value={stats.monthlySalesCount} icon={TrendingUp} tone="blue" />
          )}
          {isAdmin && (
            <StatCard label={t('monthly_profit')} value={formatLKR(stats.monthlyProfit)} icon={Wallet} tone="green" />
          )}
          {isAdmin && (
            <StatCard label={t('todays_sales')} value={stats.todaysSalesCount} icon={CalendarCheck} tone="slate" />
          )}
          {isAdmin && (
            <StatCard label={t('todays_profit')} value={formatLKR(stats.todaysProfit)} icon={Coins} tone="green" />
          )}
        </div>

        <QuickActions />

        <div className="grid gap-4 md:grid-cols-2">
          <RecentSalesList sales={recentSales} title={t('recent_sales')} />
          <EmployeePerformanceList employees={employeePerformance} title={t('employee_performance')} />
        </div>
      </main>
    </AppShell>
  );
}
