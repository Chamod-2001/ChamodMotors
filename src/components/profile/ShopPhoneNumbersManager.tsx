'use client';

import { useRef, useState, useTransition } from 'react';
import { X, Phone } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { addShopPhoneNumberAction, deleteShopPhoneNumberAction } from '@/app/profile/actions';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { ShopPhoneNumber } from '../../../types/database.types';

export function ShopPhoneNumbersManager({ phoneNumbers }: { phoneNumbers: ShopPhoneNumber[] }) {
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const { t } = useLanguage();

  async function handleAdd(formData: FormData) {
    setError(undefined);
    const label = String(formData.get('label') || '');
    const phoneNumber = String(formData.get('phone_number') || '');

    startTransition(async () => {
      const result = await addShopPhoneNumberAction(label, phoneNumber);
      if (result?.error) setError(result.error);
      else formRef.current?.reset();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteShopPhoneNumberAction(id);
    });
  }

  return (
    <div className="space-y-3">
      {phoneNumbers.length > 0 && (
        <ul className="space-y-2">
          {phoneNumbers.map((p) => (
            <li key={p.id} className="flex items-center gap-2 rounded-xl border border-slate-200 p-2 dark:border-slate-700">
              <Phone size={16} className="shrink-0 text-slate-400" />
              <span className="min-w-0 flex-1 truncate text-sm text-slate-700 dark:text-slate-300">
                {p.label && <span className="font-semibold">{p.label}: </span>}
                {p.phone_number}
              </span>
              <button
                type="button"
                onClick={() => handleDelete(p.id)}
                disabled={isPending}
                className="shrink-0 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-red-600 disabled:opacity-50 dark:hover:bg-slate-800"
                aria-label={t('remove_link')}
              >
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form ref={formRef} action={handleAdd} className="grid gap-2 sm:grid-cols-[8rem_1fr_auto]">
        <Input name="label" placeholder={t('phone_label_placeholder')} />
        <Input name="phone_number" type="tel" placeholder="e.g. 077 123 4567" required />
        <Button type="submit" disabled={isPending} className="!min-h-0 !py-3">
          {t('add')}
        </Button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
