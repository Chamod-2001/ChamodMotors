'use client';

import { useState, useTransition } from 'react';
import { Pencil, Trash2, Building2, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ZoomableImage } from '@/components/ui/ZoomableImage';
import { CompanyLogoPicker } from './CompanyLogoPicker';
import { getFinancePhotoPublicUrl } from '@/lib/storageUrls';
import { updateFinanceCompanyAction, deleteFinanceCompanyAction } from '@/app/finance/actions';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function CompanyHeader({
  company,
  isAdmin,
  officerCount,
}: {
  company: { id: string; name: string; logo_path: string | null };
  isAdmin: boolean;
  officerCount: number;
}) {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const message =
      officerCount > 0 ? t('delete_company_confirm_with_officers').replace('{count}', String(officerCount)) : t('delete_company_confirm');
    if (!confirm(message)) return;
    startTransition(async () => {
      const result = await deleteFinanceCompanyAction(company.id);
      if (result?.error) alert(result.error);
    });
  }

  if (isEditing) {
    return (
      <form
        action={(formData) => {
          setError(undefined);
          startTransition(async () => {
            const result = await updateFinanceCompanyAction(company.id, formData);
            if (result?.error) setError(result.error);
            else setIsEditing(false);
          });
        }}
        className="mb-2 space-y-3 rounded-xl border-2 border-slate-100 p-4 dark:border-slate-800"
      >
        <Input name="name" defaultValue={company.name} required autoFocus />
        <CompanyLogoPicker defaultPhotoPath={company.logo_path} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <Button type="submit" fullWidth disabled={isPending}>
            {isPending ? t('saving') : t('save')}
          </Button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border-2 border-slate-200 text-slate-500 dark:border-slate-700"
            aria-label="Cancel"
          >
            <X size={20} />
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="mb-2 flex items-center gap-2">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-slate-100 text-slate-400 dark:bg-slate-800">
        <ZoomableImage
          src={company.logo_path ? getFinancePhotoPublicUrl(company.logo_path) : null}
          className="h-full w-full object-contain"
          fallback={<Building2 size={18} />}
        />
      </div>
      <h2 className="min-w-0 flex-1 truncate text-sm font-semibold uppercase tracking-wide text-slate-500">{company.name}</h2>
      {isAdmin && (
        <>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            aria-label={t('edit')}
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="rounded-lg p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-950"
            aria-label={t('delete')}
          >
            <Trash2 size={14} />
          </button>
        </>
      )}
    </div>
  );
}
