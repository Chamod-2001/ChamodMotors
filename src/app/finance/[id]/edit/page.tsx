import { notFound } from 'next/navigation';
import { getFinanceOfficer, listFinanceCompaniesWithOfficers } from '@/lib/queries/finance';
import { FinanceOfficerForm } from '@/components/finance/FinanceOfficerForm';
import { requireAdmin } from '@/lib/queries/session';
import { getTranslator } from '@/lib/i18n/server';

export default async function EditFinanceOfficerPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const officer = await getFinanceOfficer(id);
  if (!officer) notFound();

  const companies = await listFinanceCompaniesWithOfficers();
  const t = await getTranslator();

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4 pb-10">
      <h1 className="text-xl font-bold text-slate-900">
        {t('edit')} {t('finance_officer')}
      </h1>
      <FinanceOfficerForm companies={companies.map((c) => ({ id: c.id, name: c.name }))} officer={officer} />
    </div>
  );
}
