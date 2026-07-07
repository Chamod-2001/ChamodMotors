import { CustomerForm } from '@/components/customers/CustomerForm';
import { getTranslator } from '@/lib/i18n/server';

export default async function NewCustomerPage() {
  const t = await getTranslator();
  return (
    <div className="mx-auto max-w-2xl p-4 pb-10">
      <h1 className="mb-4 text-xl font-bold text-slate-900">{t('add_customer')}</h1>
      <CustomerForm />
    </div>
  );
}
