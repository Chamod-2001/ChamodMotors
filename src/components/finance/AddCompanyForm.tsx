'use client';

import { useState, useTransition } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { createFinanceCompanyAction } from '@/app/finance/actions';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Plus, X } from 'lucide-react';

export function AddCompanyForm() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const { t } = useLanguage();

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
      >
        <Plus size={16} /> {t('add_finance_company')}
      </button>
    );
  }

  return (
    <form
      action={(formData) => {
        setError(undefined);
        startTransition(async () => {
          const result = await createFinanceCompanyAction(formData);
          if (result?.error) setError(result.error);
          else setOpen(false);
        });
      }}
      className="flex items-start gap-2"
    >
      <div className="flex-1">
        <Input name="name" placeholder="e.g. LB Finance" required autoFocus />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
      <Button type="submit" className="!min-h-[56px] !py-0 !px-4" disabled={isPending}>
        {isPending ? '...' : t('save')}
      </Button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="flex h-[56px] w-[56px] items-center justify-center rounded-xl border-2 border-slate-200 text-slate-500"
        aria-label="Cancel"
      >
        <X size={20} />
      </button>
    </form>
  );
}
