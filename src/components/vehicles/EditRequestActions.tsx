'use client';

import { useState, useTransition } from 'react';
import { Check, X } from 'lucide-react';
import { approveVehicleEditRequestAction, rejectVehicleEditRequestAction } from '@/app/vehicles/approvals/actions';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function EditRequestActions({ requestId }: { requestId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();
  const { t } = useLanguage();

  function handleApprove() {
    setError(undefined);
    startTransition(async () => {
      const result = await approveVehicleEditRequestAction(requestId);
      if (result?.error) setError(result.error);
    });
  }

  function handleReject() {
    if (!confirm(t('reject_request_confirm'))) return;
    setError(undefined);
    startTransition(async () => {
      const result = await rejectVehicleEditRequestAction(requestId);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleApprove}
          disabled={isPending}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
        >
          <Check size={16} /> {t('approve')}
        </button>
        <button
          type="button"
          onClick={handleReject}
          disabled={isPending}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border-2 border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          <X size={16} /> {t('reject')}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
