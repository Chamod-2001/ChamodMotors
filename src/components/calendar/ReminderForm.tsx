'use client';

import { useRef, useState, useTransition } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { createReminderAction } from '@/app/calendar/actions';
import { enqueueOfflineAction } from '@/lib/offlineQueue';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { SimpleCustomer, SimpleVehicle, SimpleFinanceOfficer } from '@/lib/queries/finance';

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const totalMinutes = i * 30;
  const hour24 = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  const value = `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const ampm = hour24 < 12 ? 'AM' : 'PM';
  const label = `${hour12}:${String(minute).padStart(2, '0')} ${ampm}`;
  return { value, label };
});

export function ReminderForm({
  vehicles,
  customers,
  officers,
  defaultDate,
}: {
  vehicles: SimpleVehicle[];
  customers: SimpleCustomer[];
  officers: SimpleFinanceOfficer[];
  /** "YYYY-MM-DD" — pre-fills the due date, e.g. from a day picked on the calendar above. */
  defaultDate: string;
}) {
  const [error, setError] = useState<string | undefined>();
  const [offlineSaved, setOfflineSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const { t } = useLanguage();

  async function handleSubmit(formData: FormData) {
    setError(undefined);
    setOfflineSaved(false);

    if (!navigator.onLine) {
      enqueueOfflineAction({
        type: 'reminder',
        title: String(formData.get('title') || ''),
        due_date: String(formData.get('due_date') || ''),
        due_time: String(formData.get('due_time') || '09:00'),
        note: String(formData.get('note') || ''),
        vehicle_id: String(formData.get('vehicle_id') || ''),
        customer_id: String(formData.get('customer_id') || ''),
        finance_officer_id: String(formData.get('finance_officer_id') || ''),
      });
      setOfflineSaved(true);
      formRef.current?.reset();
      return;
    }

    startTransition(async () => {
      const result = await createReminderAction(formData);
      if (result?.error) setError(result.error);
      else formRef.current?.reset();
    });
  }

  return (
    <form key={defaultDate} ref={formRef} action={handleSubmit} className="space-y-3">
      <Input name="title" required placeholder={t('reminder_title_placeholder')} className="!py-3 !text-base !min-h-0" />

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Input type="date" name="due_date" required defaultValue={defaultDate} label={t('due_date_label')} className="!py-3 !text-base !min-h-0" />
        <Select name="due_time" defaultValue="09:00" label={t('due_time_label')} className="!py-3 !text-sm !min-h-0">
          {TIME_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </div>

      <textarea
        name="note"
        rows={2}
        placeholder={t('notes')}
        className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-base focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-light dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      />

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Select name="vehicle_id" defaultValue="" className="!py-3 !text-sm !min-h-0">
          <option value="">{t('vehicle_optional')}</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.label}
            </option>
          ))}
        </Select>
        <Select name="customer_id" defaultValue="" className="!py-3 !text-sm !min-h-0">
          <option value="">{t('customer_optional')}</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.full_name}
            </option>
          ))}
        </Select>
        <Select name="finance_officer_id" defaultValue="" className="!py-3 !text-sm !min-h-0">
          <option value="">{t('officer_optional')}</option>
          {officers.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </Select>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {offlineSaved && <p className="text-sm text-amber-600">{t('saved_offline_message')}</p>}

      <Button type="submit" fullWidth disabled={isPending} className="!min-h-[48px]">
        {isPending ? t('saving') : t('add_reminder')}
      </Button>
    </form>
  );
}
