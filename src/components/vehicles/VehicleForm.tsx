'use client';

import { useState, useTransition } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { VehicleImagePicker, type PickedImage } from './VehicleImagePicker';
import { formatLKR } from '@/lib/format';
import {
  createVehicleAction,
  updateVehicleAction,
  deleteVehicleImageAction,
  submitVehicleEditRequestAction,
} from '@/app/vehicles/actions';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { VehicleDetail } from '@/lib/queries/vehicles';
import type { VehicleEditRequestItem } from '@/lib/queries/vehicleEditRequests';

interface VehicleFormProps {
  vehicle?: VehicleDetail | null;
  isAdmin: boolean;
  /** An already-pending request for this vehicle, if the employee already submitted one. */
  pendingRequest?: VehicleEditRequestItem | null;
}

export function VehicleForm({ vehicle, isAdmin, pendingRequest }: VehicleFormProps) {
  const { t } = useLanguage();
  const isEdit = Boolean(vehicle);
  // Non-admins editing an existing vehicle go through the request/approval
  // flow instead of saving directly — see submitVehicleEditRequestAction.
  const isEmployeeEdit = isEdit && !isAdmin;
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const [newImages, setNewImages] = useState<PickedImage[]>([]);
  const [existingImages, setExistingImages] = useState(vehicle?.images ?? []);
  const [buyingPrice, setBuyingPrice] = useState(vehicle?.buying_price?.toString() ?? '');
  const [sellingPrice, setSellingPrice] = useState(vehicle?.selling_price?.toString() ?? '');

  const grossProfit = (Number(sellingPrice) || 0) - (Number(buyingPrice) || 0);

  async function handleRemoveExisting(imageId: string, storagePath: string) {
    if (!vehicle) return;
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    await deleteVehicleImageAction(imageId, storagePath, vehicle.id);
  }

  async function handleSubmit(formData: FormData) {
    setError(undefined);
    newImages.forEach((img) => formData.append('imagePaths', img.path));

    startTransition(async () => {
      const result = !vehicle
        ? await createVehicleAction(formData)
        : isAdmin
          ? await updateVehicleAction(vehicle.id, formData)
          : await submitVehicleEditRequestAction(vehicle.id, formData);
      if (result?.error) setError(result.error);
    });
  }

  if (isEmployeeEdit && pendingRequest) {
    return (
      <div className="rounded-xl bg-amber-50 px-4 py-4 text-sm text-amber-800">
        <p className="font-semibold">{t('edit_request_pending_title')}</p>
        <p className="mt-1">{t('edit_request_pending_message')}</p>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <VehicleImagePicker
        existingImages={existingImages}
        onRemoveExisting={handleRemoveExisting}
        images={newImages}
        onChange={setNewImages}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="brand" label={t('brand')} required defaultValue={vehicle?.brand} placeholder="e.g. Bajaj" />
        <Input name="model" label={t('model')} required defaultValue={vehicle?.model} placeholder="e.g. Pulsar 150" />
        <Input
          name="manufacturing_year"
          label={t('manufacturing_year')}
          type="number"
          defaultValue={vehicle?.manufacturing_year ?? ''}
          placeholder="2023"
        />
        <Select name="vehicle_type" label={t('vehicle_type')} defaultValue={vehicle?.vehicle_type ?? 'motorcycle'}>
          <option value="motorcycle">{t('motorcycle')}</option>
          <option value="three_wheeler">{t('three_wheeler')}</option>
          <option value="scooter">{t('scooter')}</option>
          <option value="other">{t('other_vehicle_type')}</option>
        </Select>
        <Input
          name="registration_number"
          label={t('registration_number')}
          defaultValue={vehicle?.registration_number ?? ''}
          placeholder="e.g. WP CAB-1234"
        />
        <Input name="engine_number" label={t('engine_number')} defaultValue={vehicle?.engine_number ?? ''} />
        <Input name="chassis_number" label={t('chassis_number')} defaultValue={vehicle?.chassis_number ?? ''} />
        <Input name="mileage" label={t('mileage') + ' (km)'} type="number" defaultValue={vehicle?.mileage ?? ''} />
        <Select name="fuel_type" label={t('fuel_type')} defaultValue={vehicle?.fuel_type ?? 'petrol'}>
          <option value="petrol">{t('petrol')}</option>
          <option value="diesel">{t('diesel')}</option>
          <option value="electric">{t('electric')}</option>
          <option value="hybrid">{t('hybrid')}</option>
        </Select>
        <Input name="color" label={t('color')} defaultValue={vehicle?.color ?? ''} />
      </div>

      {isAdmin ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              name="buying_price"
              label={`${t('buying_price')} (LKR)`}
              type="number"
              required
              value={buyingPrice}
              onChange={(e) => setBuyingPrice(e.target.value)}
            />
            <Input
              name="selling_price"
              label={`${t('selling_price')} (LKR)`}
              type="number"
              required
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
            />
            <Input
              name="buying_date"
              label={t('buying_date')}
              type="date"
              required
              defaultValue={vehicle?.buying_date ?? new Date().toISOString().slice(0, 10)}
            />
          </div>

          <div className="rounded-xl bg-green-50 px-4 py-3">
            <p className="text-sm text-green-700">{t('gross_profit_auto')}</p>
            <p className="text-xl font-bold text-green-800">{formatLKR(grossProfit)}</p>
          </div>

          <Select name="status" label={t('status')} defaultValue={vehicle?.status ?? 'available'}>
            <option value="available">{t('available')}</option>
            <option value="reserved">{t('reserved')}</option>
            <option value="sold">{t('sold')}</option>
          </Select>
        </>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            name="selling_price"
            label={`${t('selling_price')} (LKR)`}
            type="number"
            required
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
          />
          <Input
            name="buying_date"
            label={t('buying_date')}
            type="date"
            required
            defaultValue={vehicle?.buying_date ?? new Date().toISOString().slice(0, 10)}
          />
        </div>
      )}

      <div>
        <label className="mb-2 block text-base font-medium text-slate-700">{t('notes')}</label>
        <textarea
          name="notes"
          rows={3}
          defaultValue={vehicle?.notes ?? ''}
          className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-lg focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-light"
        />
      </div>

      {isEmployeeEdit && <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">{t('edit_request_notice')}</p>}

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <Button type="submit" fullWidth disabled={isPending}>
        {isPending ? t('saving') : !vehicle ? t('add_vehicle') : isAdmin ? t('save_changes') : t('submit_for_approval')}
      </Button>
    </form>
  );
}
