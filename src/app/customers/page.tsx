import Link from 'next/link';
import { listCustomers } from '@/lib/queries/customers';
import { CustomerCard } from '@/components/customers/CustomerCard';
import { Button } from '@/components/ui/Button';
import { LiveSearchInput } from '@/components/ui/LiveSearchInput';
import { AppShell } from '@/components/layout/AppShell';
import { getTranslator } from '@/lib/i18n/server';
import { UserPlus } from 'lucide-react';

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const customers = await listCustomers(q);
  const t = await getTranslator();

  return (
    <AppShell title={t('customers')}>
      <div className="mx-auto max-w-2xl space-y-4 p-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-slate-900">{t('customers')}</h1>
          <Link href="/customers/new">
            <Button className="!py-2 !px-4 !min-h-0">
              <UserPlus size={18} /> {t('add')}
            </Button>
          </Link>
        </div>

        <LiveSearchInput placeholder={t('search_customers_placeholder')} />

        <div className="space-y-3">
          {customers.length === 0 ? (
            <p className="py-10 text-center text-slate-400">{t('no_customers_found')}</p>
          ) : (
            customers.map((customer) => <CustomerCard key={customer.id} customer={customer} />)
          )}
        </div>
      </div>
    </AppShell>
  );
}
