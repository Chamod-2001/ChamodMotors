'use client';

import { useRef, useState, useTransition } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { addShopLocationAction, deleteShopLocationAction } from '@/app/profile/actions';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { ShopLocation } from '../../../types/database.types';

export function ShopLocationsManager({ locations }: { locations: ShopLocation[] }) {
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const { t } = useLanguage();

  async function handleAdd(formData: FormData) {
    setError(undefined);
    startTransition(async () => {
      const result = await addShopLocationAction(formData);
      if (result?.error) setError(result.error);
      else formRef.current?.reset();
    });
  }

  function handleDelete(locationId: string) {
    startTransition(async () => {
      await deleteShopLocationAction(locationId);
    });
  }

  return (
    <div className="space-y-3">
      {locations.length > 0 && (
        <ul className="space-y-2">
          {locations.map((location) => (
            <li
              key={location.id}
              className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900 dark:text-slate-100">{location.label}</p>
                {location.address && (
                  <p className="truncate text-sm text-slate-500 dark:text-slate-400">{location.address}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleDelete(location.id)}
                disabled={isPending}
                className="shrink-0 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-red-600 disabled:opacity-50 dark:hover:bg-slate-800"
                aria-label={t('remove_location')}
              >
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form ref={formRef} action={handleAdd} className="space-y-2 rounded-xl border border-dashed border-slate-300 p-3 dark:border-slate-700">
        <Input name="label" placeholder={t('city_branch_placeholder')} required />
        <Input name="address" placeholder={t('address_optional_placeholder')} />
        <Input name="map_url" type="url" placeholder={t('maps_link_optional_placeholder')} />
        <Input name="google_review_url" type="url" placeholder={t('google_review_link_optional_placeholder')} />
        <Button type="submit" fullWidth disabled={isPending} className="!min-h-0 !py-3">
          {isPending ? t('adding') : t('add_location')}
        </Button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
