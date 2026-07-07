import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { getTranslator } from '@/lib/i18n/server';
import type { CustomerListItem } from '@/lib/queries/customers';
import { User } from 'lucide-react';

export async function CustomerCard({ customer }: { customer: CustomerListItem }) {
  const t = await getTranslator();

  return (
    <Link href={`/customers/${customer.id}`}>
      <Card className="flex items-center gap-4 transition hover:shadow-md active:scale-[0.99]">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand">
          <User size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-slate-900">{customer.full_name}</p>
          <p className="truncate text-sm text-slate-500">
            {customer.phone_number} · {customer.nic_number}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-semibold text-slate-700">{customer.vehicles_purchased}</p>
          <p className="text-xs text-slate-400">{t('purchased_suffix')}</p>
        </div>
      </Card>
    </Link>
  );
}
