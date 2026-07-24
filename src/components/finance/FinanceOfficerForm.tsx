'use client';

import { useState, useTransition } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { OfficerPhotoPicker } from './OfficerPhotoPicker';
import { createFinanceOfficerAction, updateFinanceOfficerAction } from '@/app/finance/actions';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { FinanceOfficerRow } from '@/lib/queries/finance';

interface FinanceOfficerFormProps {
  companies: { id: string; name: string }[];
  officer?: FinanceOfficerRow | null;
}

export function FinanceOfficerForm({ companies, officer }: FinanceOfficerFormProps) {
  const { t } = useLanguage();
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError(undefined);
    startTransition(async () => {
      const result = officer
        ? await updateFinanceOfficerAction(officer.id, formData)
        : await createFinanceOfficerAction(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <OfficerPhotoPicker defaultPhotoPath={officer?.photo_path} />
      {!officer && (
        <Select name="finance_company_id" label={t('finance_company')} required defaultValue="">
          <option value="" disabled>
            {t('select_company')}
          </option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      )}

      <Input name="officer_name" label={t('officer_name')} required defaultValue={officer?.officer_name} />
      <Input name="phone_number" label={t('phone_number')} type="tel" defaultValue={officer?.phone_number ?? ''} />
      <Input
        name="whatsapp_number"
        label={t('whatsapp_number')}
        type="tel"
        defaultValue={officer?.whatsapp_number ?? ''}
        placeholder="Leave blank to use Phone Number"
      />

      <div>
        <label className="mb-2 block text-base font-medium text-slate-700">{t('notes')}</label>
        <textarea
          name="notes"
          rows={3}
          defaultValue={officer?.notes ?? ''}
          className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-lg focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-light"
        />
      </div>

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <Button type="submit" fullWidth disabled={isPending}>
        {isPending ? t('saving') : officer ? t('save_changes') : t('add_officer')}
      </Button>
    </form>
  );
}
