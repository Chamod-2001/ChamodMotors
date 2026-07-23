'use client';

import { useState, useTransition } from 'react';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PartyDocumentPicker } from '@/components/documents/PartyDocumentPicker';
import { recordSaleAction } from '@/app/customers/actions';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { SellableVehicle } from '@/lib/queries/customers';

export function RecordSaleForm({
  customerId,
  sellableVehicles,
  onDone,
}: {
  customerId: string;
  sellableVehicles: SellableVehicle[];
  onDone: () => void;
}) {
  const { t } = useLanguage();
  const [error, setError] = useState<string | undefined>();
  const [selectedVehicleId, setSelectedVehicleId] = useState(sellableVehicles[0]?.id ?? '');
  const [isPending, startTransition] = useTransition();

  const selectedVehicle = sellableVehicles.find((v) => v.id === selectedVehicleId);

  async function handleSubmit(formData: FormData) {
    setError(undefined);
    startTransition(async () => {
      const result = await recordSaleAction(customerId, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        onDone();
      }
    });
  }

  if (sellableVehicles.length === 0) {
    return <p className="text-sm text-slate-400">{t('no_sellable_vehicles')}</p>;
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <Select
        name="vehicle_id"
        label={t('vehicle')}
        value={selectedVehicleId}
        onChange={(e) => setSelectedVehicleId(e.target.value)}
      >
        {sellableVehicles.map((v) => (
          <option key={v.id} value={v.id}>
            {v.label}
          </option>
        ))}
      </Select>

      <Input
        name="sale_price"
        label={t('sale_price')}
        type="number"
        required
        defaultValue={selectedVehicle?.selling_price ?? ''}
        key={selectedVehicleId}
      />

      <Input
        name="purchase_date"
        label={t('purchase_date_label')}
        type="date"
        required
        defaultValue={new Date().toISOString().slice(0, 10)}
      />

      <PartyDocumentPicker
        namePrefix="buyer"
        title={t('buyer_documents_title')}
        letterDocumentType="sale_letter"
        letterLabel={t('selling_letter_label')}
      />

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <Button type="submit" fullWidth disabled={isPending}>
        {isPending ? t('saving') : t('record_purchase')}
      </Button>
    </form>
  );
}
