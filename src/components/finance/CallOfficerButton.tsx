'use client';

import { useState, useTransition } from 'react';
import { contactFinanceOfficerAction } from '@/app/finance/actions';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Phone, Loader2 } from 'lucide-react';

/** Note: a real phone call can't be masked — the number always ends up in
 * the caller's own phone dialer/call log regardless of who places it. This
 * is offered to employees too (by request), same as WhatsApp — the number
 * just never appears as text anywhere in this app's own UI for them. */
export function CallOfficerButton({ officerId }: { officerId: string }) {
  const { t } = useLanguage();
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  function handleCall() {
    setError(undefined);
    startTransition(async () => {
      const result = await contactFinanceOfficerAction(officerId, 'call');
      if (result.error) setError(result.error);
      else if (result.url) window.location.href = result.url;
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleCall}
        disabled={isPending}
        className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-blue-50 px-3 py-3 text-sm font-semibold text-blue-700 disabled:opacity-50 dark:bg-blue-950/40 dark:text-blue-400"
      >
        {isPending ? <Loader2 size={18} className="animate-spin" /> : <Phone size={18} />} {t('call')}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
