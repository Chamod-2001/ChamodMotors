import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { AppShell } from '@/components/layout/AppShell';
import { requireAdmin } from '@/lib/queries/session';
import { getTranslator } from '@/lib/i18n/server';
import { TrendingUp, Wallet, Bike, Users, Trophy, ChevronRight } from 'lucide-react';
import type { TranslationKey } from '@/lib/i18n/translations';

const REPORTS: { href: string; labelKey: TranslationKey; icon: typeof TrendingUp; tone: string }[] = [
  { href: '/reports/sales', labelKey: 'monthly_sales_report', icon: TrendingUp, tone: 'bg-brand-light text-brand' },
  { href: '/reports/profit', labelKey: 'monthly_profit_report', icon: Wallet, tone: 'bg-green-50 text-green-600' },
  { href: '/reports/inventory', labelKey: 'vehicle_inventory_report', icon: Bike, tone: 'bg-amber-50 text-amber-600' },
  { href: '/reports/customers', labelKey: 'customer_purchase_report', icon: Users, tone: 'bg-purple-50 text-purple-600' },
  { href: '/reports/employees', labelKey: 'employee_sales_report', icon: Trophy, tone: 'bg-rose-50 text-rose-600' },
];

export default async function ReportsIndexPage() {
  await requireAdmin();
  const t = await getTranslator();

  return (
    <AppShell title={t('reports')}>
      <div className="mx-auto max-w-2xl space-y-3 p-4">
        <h1 className="text-xl font-bold text-slate-900">{t('reports')}</h1>

        {REPORTS.map(({ href, labelKey, icon: Icon, tone }) => (
          <Link key={href} href={href}>
            <Card className="flex items-center gap-4 transition hover:shadow-md active:scale-[0.99]">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tone}`}>
                <Icon size={22} />
              </div>
              <p className="flex-1 font-semibold text-slate-900">{t(labelKey)}</p>
              <ChevronRight size={20} className="text-slate-300" />
            </Card>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
