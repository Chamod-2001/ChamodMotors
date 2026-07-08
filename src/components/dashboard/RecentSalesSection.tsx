import { getRecentSales } from '@/lib/queries/dashboard';
import { RecentSalesList } from '@/components/dashboard/RecentSalesList';
import type { Translator } from '@/lib/i18n/server';

export async function RecentSalesSection({ t, isAdmin }: { t: Translator; isAdmin: boolean }) {
  const sales = await getRecentSales(5);
  return <RecentSalesList sales={sales} title={t('recent_sales')} isAdmin={isAdmin} />;
}
