'use client';

import { useState, useTransition } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { updateShopProfileAction } from '@/app/profile/actions';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { ShopProfile } from '../../../types/database.types';

export function ShopProfileEditForm({ profile }: { profile: ShopProfile }) {
  const { t } = useLanguage();
  const [error, setError] = useState<string | undefined>();
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError(undefined);
    setSaved(false);
    startTransition(async () => {
      const result = await updateShopProfileAction(formData);
      if (result?.error) setError(result.error);
      else setSaved(true);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <Input name="business_name" label={t('business_name')} required defaultValue={profile.business_name} />

      <div>
        <label className="mb-2 block text-base font-medium text-slate-700 dark:text-slate-300">{t('description')}</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={profile.description ?? ''}
          placeholder={t('describe_shop_placeholder')}
          className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-lg focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-light dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="phone_number" label={t('phone_number')} type="tel" defaultValue={profile.phone_number ?? ''} />
        <Input
          name="whatsapp_number"
          label={t('whatsapp_number')}
          type="tel"
          defaultValue={profile.whatsapp_number ?? ''}
          placeholder={t('leave_blank_use_phone')}
        />
      </div>

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {saved && !error && <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{t('saved_confirmation')}</p>}

      <Button type="submit" fullWidth disabled={isPending}>
        {isPending ? t('saving') : t('save_profile')}
      </Button>
    </form>
  );
}
