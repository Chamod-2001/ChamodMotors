import Link from 'next/link';
import { listFinanceCompaniesWithOfficers } from '@/lib/queries/finance';
import { getCurrentEmployee } from '@/lib/queries/session';
import { getTranslator } from '@/lib/i18n/server';
import { getFinancePhotoPublicUrl } from '@/lib/storageUrls';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ZoomableImage } from '@/components/ui/ZoomableImage';
import { AppShell } from '@/components/layout/AppShell';
import { AddCompanyForm } from '@/components/finance/AddCompanyForm';
import { FinanceOfficerCard } from '@/components/finance/FinanceOfficerCard';
import { UserPlus, Building2 } from 'lucide-react';

export default async function FinancePage() {
  const [companies, employee, t] = await Promise.all([
    listFinanceCompaniesWithOfficers(),
    getCurrentEmployee(),
    getTranslator(),
  ]);
  const isAdmin = employee?.role === 'admin';

  return (
    <AppShell title={t('finance')}>
      <div className="mx-auto max-w-2xl space-y-4 p-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-slate-900">{t('finance')}</h1>
          {isAdmin && (
            <Link href="/finance/officers/new">
              <Button className="!py-2 !px-4 !min-h-0">
                <UserPlus size={18} /> Officer
              </Button>
            </Link>
          )}
        </div>

        {isAdmin && <AddCompanyForm />}

        {companies.length === 0 ? (
          <Card>
            <p className="py-6 text-center text-slate-400">
              {t('no_companies_yet')} {isAdmin ? t('add_one_to_start') : t('ask_admin_add_company')}
            </p>
          </Card>
        ) : (
          companies.map((company) => (
            <div key={company.id}>
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-md bg-slate-100 text-slate-400 dark:bg-slate-800">
                  <ZoomableImage
                    src={company.logo_path ? getFinancePhotoPublicUrl(company.logo_path) : null}
                    className="h-full w-full object-contain"
                    fallback={<Building2 size={14} />}
                  />
                </div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{company.name}</h2>
              </div>
              {company.officers.length === 0 ? (
                <p className="mb-4 text-sm text-slate-400">{t('no_officers_yet')}</p>
              ) : (
                <div className="mb-4 space-y-2">
                  {company.officers.map((officer) => (
                    <FinanceOfficerCard
                      key={officer.id}
                      officer={
                        isAdmin
                          ? officer
                          : { ...officer, phone_number: null, whatsapp_number: null }
                      }
                      isAdmin={isAdmin}
                      hasContact={Boolean(officer.phone_number || officer.whatsapp_number)}
                    />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </AppShell>
  );
}
