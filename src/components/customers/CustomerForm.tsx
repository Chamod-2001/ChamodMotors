'use client';

import { useState, useTransition } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { CustomerPhotoPicker } from './CustomerPhotoPicker';
import { createCustomerAction, updateCustomerAction } from '@/app/customers/actions';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { CustomerDetail } from '@/lib/queries/customers';

export function CustomerForm({ customer }: { customer?: CustomerDetail | null }) {
  const { t } = useLanguage();
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError(undefined);
    startTransition(async () => {
      const result = customer
        ? await updateCustomerAction(customer.id, formData)
        : await createCustomerAction(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <CustomerPhotoPicker defaultPhotoPath={customer?.photo_path} />
      <Input name="full_name" label={t('full_name')} required defaultValue={customer?.full_name} />
      <Input name="nic_number" label={t('nic_number')} required defaultValue={customer?.nic_number} />
      <Input name="phone_number" label={t('phone_number')} required type="tel" defaultValue={customer?.phone_number} />
      <Input name="address" label={t('address')} defaultValue={customer?.address ?? ''} />
      <Input name="occupation" label={t('occupation')} defaultValue={customer?.occupation ?? ''} />

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <Button type="submit" fullWidth disabled={isPending}>
        {isPending ? t('saving') : customer ? t('save_changes') : t('add_customer')}
      </Button>
    </form>
  );
}
