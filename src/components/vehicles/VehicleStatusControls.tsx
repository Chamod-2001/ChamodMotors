'use client';

import { useTransition } from 'react';
import { clsx } from 'clsx';
import { updateVehicleStatusAction } from '@/app/vehicles/actions';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { VehicleStatus } from '../../../types/database.types';
import type { TranslationKey } from '@/lib/i18n/translations';

const OPTIONS: { value: VehicleStatus; labelKey: TranslationKey }[] = [
  { value: 'available', labelKey: 'available' },
  { value: 'reserved', labelKey: 'reserved' },
  { value: 'sold', labelKey: 'sold' },
];

export function VehicleStatusControls({
  vehicleId,
  currentStatus,
}: {
  vehicleId: string;
  currentStatus: VehicleStatus;
}) {
  const [isPending, startTransition] = useTransition();
  const { t } = useLanguage();

  return (
    <div className="flex gap-2">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          disabled={isPending || opt.value === currentStatus}
          onClick={() => startTransition(() => updateVehicleStatusAction(vehicleId, opt.value))}
          className={clsx(
            'flex-1 rounded-xl py-3 text-sm font-semibold transition disabled:opacity-100',
            opt.value === currentStatus
              ? 'bg-brand text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          )}
        >
          {t(opt.labelKey)}
        </button>
      ))}
    </div>
  );
}
