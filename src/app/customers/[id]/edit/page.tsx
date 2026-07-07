import { notFound } from 'next/navigation';
import { getCustomer } from '@/lib/queries/customers';
import { CustomerForm } from '@/components/customers/CustomerForm';
import { getTranslator } from '@/lib/i18n/server';

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await getCustomer(id);
  if (!customer) notFound();
  const t = await getTranslator();

  return (
    <div className="mx-auto max-w-2xl p-4 pb-10">
      <h1 className="mb-4 text-xl font-bold text-slate-900">
        {t('edit')} {t('customer')}
      </h1>
      <CustomerForm customer={customer} />
    </div>
  );
}
