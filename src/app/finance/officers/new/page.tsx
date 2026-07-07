import Link from 'next/link';
import { listFinanceCompaniesWithOfficers } from '@/lib/queries/finance';
import { FinanceOfficerForm } from '@/components/finance/FinanceOfficerForm';
import { requireAdmin } from '@/lib/queries/session';
import { getTranslator } from '@/lib/i18n/server';

export default async function NewFinanceOfficerPage() {
  await requireAdmin();
  const companies = await listFinanceCompaniesWithOfficers();
  const t = await getTranslator();

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4 pb-10">
      <Link href="/finance" className="text-sm font-medium text-brand">
        {t('back')}
      </Link>
      <h1 className="text-xl font-bold text-slate-900">{t('add_officer')}</h1>

      {companies.length === 0 ? (
        <p className="text-slate-500">{t('add_finance_company_first')}</p>
      ) : (
        <FinanceOfficerForm companies={companies.map((c) => ({ id: c.id, name: c.name }))} />
      )}
    </div>
  );
}
