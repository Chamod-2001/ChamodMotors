import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getCurrentEmployee } from '@/lib/queries/session';
import { AppShell } from '@/components/layout/AppShell';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { RecentSalesSection } from '@/components/dashboard/RecentSalesSection';
import { EmployeePerformanceSection } from '@/components/dashboard/EmployeePerformanceSection';
import { StatsGridSkeleton, CardSkeleton } from '@/components/dashboard/DashboardSkeletons';
import { getTranslator } from '@/lib/i18n/server';

export default async function DashboardPage() {
  const [employee, t] = await Promise.all([getCurrentEmployee(), getTranslator()]);

  if (!employee) redirect('/login');
  const isAdmin = employee.role === 'admin';

  return (
    <AppShell title={t('dashboard')}>
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        <Suspense fallback={<StatsGridSkeleton isAdmin={isAdmin} />}>
          <StatsGrid isAdmin={isAdmin} t={t} />
        </Suspense>

        <QuickActions isAdmin={isAdmin} />

        <div className="grid gap-4 md:grid-cols-2">
          <Suspense fallback={<CardSkeleton />}>
            <RecentSalesSection t={t} />
          </Suspense>
          <Suspense fallback={<CardSkeleton />}>
            <EmployeePerformanceSection t={t} />
          </Suspense>
        </div>
      </main>
    </AppShell>
  );
}
