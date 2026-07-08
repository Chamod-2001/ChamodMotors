import { formatLKR } from '@/lib/format';
import { getTranslator } from '@/lib/i18n/server';
import type { VehicleEditChanges, VehicleEditableField } from '../../../types/database.types';
import type { TranslationKey } from '@/lib/i18n/translations';

const FIELD_LABEL_KEYS: Record<VehicleEditableField, TranslationKey> = {
  brand: 'brand',
  model: 'model',
  manufacturing_year: 'manufacturing_year',
  vehicle_type: 'vehicle_type',
  registration_number: 'registration_number',
  engine_number: 'engine_number',
  chassis_number: 'chassis_number',
  mileage: 'mileage',
  fuel_type: 'fuel_type',
  color: 'color',
  selling_price: 'selling_price',
  buying_date: 'buying_date',
  notes: 'notes',
};

function formatValue(field: VehicleEditableField, value: string | number | null, t: (key: TranslationKey) => string): string {
  if (value === null || value === '') return '—';
  if (field === 'selling_price') return formatLKR(Number(value));
  if (field === 'buying_date') {
    return new Date(String(value)).toLocaleDateString('en-LK', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  // vehicle_type's "other" option uses a differently-named key than the
  // stored value (other_vehicle_type, since "other" is used for fuel labels too).
  if (field === 'vehicle_type') return t(value === 'other' ? 'other_vehicle_type' : (String(value) as TranslationKey));
  if (field === 'fuel_type') return t(String(value) as TranslationKey);
  return String(value);
}

export async function EditRequestDiff({ changes }: { changes: VehicleEditChanges }) {
  const t = await getTranslator();
  const entries = Object.entries(changes) as [
    VehicleEditableField,
    { old: string | number | null; new: string | number | null },
  ][];

  return (
    <dl className="space-y-2 text-sm">
      {entries.map(([field, change]) => (
        <div key={field} className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t(FIELD_LABEL_KEYS[field])}</dt>
          <dd className="mt-0.5 flex flex-wrap items-center gap-2">
            <span className="text-slate-400 line-through">{formatValue(field, change.old, t)}</span>
            <span className="text-slate-400">→</span>
            <span className="font-semibold text-slate-800 dark:text-slate-100">{formatValue(field, change.new, t)}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
