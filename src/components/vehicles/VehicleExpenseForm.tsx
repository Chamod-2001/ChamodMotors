'use client';

import { useState, useTransition } from 'react';
import { Camera, Check, Loader2 } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { MoneyInput } from '@/components/ui/MoneyInput';
import { uploadDocumentFile } from '@/lib/uploadDocument';
import { addVehicleExpenseAction } from '@/app/vehicles/expenses/actions';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { VehicleExpenseType } from '../../../types/database.types';
import type { TranslationKey } from '@/lib/i18n/translations';

const EXPENSE_TYPE_OPTIONS: { value: VehicleExpenseType; labelKey: TranslationKey }[] = [
  { value: 'paint', labelKey: 'expense_type_paint' },
  { value: 'upholstery', labelKey: 'expense_type_upholstery' },
  { value: 'parts', labelKey: 'expense_type_parts' },
  { value: 'labor', labelKey: 'expense_type_labor' },
  { value: 'cleaning', labelKey: 'expense_type_cleaning' },
  { value: 'other', labelKey: 'expense_type_other' },
];

export function VehicleExpenseForm({ vehicleId, onDone }: { vehicleId: string; onDone?: () => void }) {
  const { t } = useLanguage();
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [receiptPath, setReceiptPath] = useState('');

  async function handleReceiptPick(file: File | undefined) {
    if (!file) return;
    setError(undefined);
    setIsUploading(true);
    try {
      const path = await uploadDocumentFile(file);
      setReceiptPath(path);
    } catch {
      setError(t('document_upload_failed'));
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSubmit(formData: FormData) {
    setError(undefined);
    startTransition(async () => {
      const result = await addVehicleExpenseAction(vehicleId, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        onDone?.();
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      <Select name="expense_type" label={t('expense_type_label')} defaultValue="other">
        {EXPENSE_TYPE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {t(opt.labelKey)}
          </option>
        ))}
      </Select>

      <MoneyInput name="amount" label={`${t('expense_amount_label')} (LKR)`} required />

      <Input name="description" label={t('expense_description_label')} />

      <label
        className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed px-3 py-3 text-sm font-medium transition ${
          receiptPath
            ? 'border-green-400 bg-green-50 text-green-700 dark:border-green-600 dark:bg-green-950/30 dark:text-green-400'
            : 'border-slate-300 text-slate-500 hover:border-brand-dark hover:text-brand dark:border-slate-700'
        }`}
      >
        {isUploading ? <Loader2 size={16} className="animate-spin" /> : receiptPath ? <Check size={16} /> : <Camera size={16} />}
        {t('expense_receipt_label')}
        <input
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          disabled={isUploading}
          onChange={(e) => handleReceiptPick(e.target.files?.[0])}
        />
      </label>
      <input type="hidden" name="receiptPath" value={receiptPath} />

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <Button type="submit" fullWidth disabled={isPending}>
        {isPending ? t('saving') : t('add_expense')}
      </Button>
    </form>
  );
}
