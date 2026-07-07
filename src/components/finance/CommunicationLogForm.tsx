'use client';

import { useRef, useState, useTransition } from 'react';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { logFinanceCommunicationAction } from '@/app/finance/actions';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { SimpleCustomer, SimpleVehicle } from '@/lib/queries/finance';

export function CommunicationLogForm({
  officerId,
  customers,
  vehicles,
}: {
  officerId: string;
  customers: SimpleCustomer[];
  vehicles: SimpleVehicle[];
}) {
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const { t } = useLanguage();

  async function handleSubmit(formData: FormData) {
    setError(undefined);
    startTransition(async () => {
      const result = await logFinanceCommunicationAction(officerId, formData);
      if (result?.error) setError(result.error);
      else formRef.current?.reset();
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-3">
      <textarea
        name="note"
        rows={2}
        required
        placeholder="e.g. Sent NIC and bill copy, waiting for approval..."
        className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-base focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-light"
      />

      <div className="grid grid-cols-2 gap-2">
        <Select name="customer_id" defaultValue="" className="!py-3 !text-sm !min-h-0">
          <option value="">{t('customer_optional')}</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.full_name}
            </option>
          ))}
        </Select>
        <Select name="vehicle_id" defaultValue="" className="!py-3 !text-sm !min-h-0">
          <option value="">{t('vehicle_optional')}</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.label}
            </option>
          ))}
        </Select>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" fullWidth disabled={isPending} className="!min-h-[48px]">
        {isPending ? t('saving') : t('add_note')}
      </Button>
    </form>
  );
}
