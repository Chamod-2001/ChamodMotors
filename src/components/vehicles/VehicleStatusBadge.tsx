import { clsx } from 'clsx';
import { getTranslator } from '@/lib/i18n/server';
import type { VehicleStatus } from '../../../types/database.types';
import type { TranslationKey } from '@/lib/i18n/translations';

const STYLES: Record<VehicleStatus, string> = {
  available: 'bg-green-100 text-green-700',
  reserved: 'bg-amber-100 text-amber-700',
  sold: 'bg-slate-200 text-slate-600',
};

const LABEL_KEYS: Record<VehicleStatus, TranslationKey> = {
  available: 'available',
  reserved: 'reserved',
  sold: 'sold',
};

export async function VehicleStatusBadge({ status }: { status: VehicleStatus }) {
  const t = await getTranslator();

  return (
    <span className={clsx('rounded-full px-3 py-1 text-xs font-semibold', STYLES[status])}>
      {t(LABEL_KEYS[status])}
    </span>
  );
}
