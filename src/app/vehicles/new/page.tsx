import { VehicleForm } from '@/components/vehicles/VehicleForm';
import { requireAdmin } from '@/lib/queries/session';
import { getTranslator } from '@/lib/i18n/server';
import { listVehicleCatalog } from '@/lib/queries/vehicleCatalog';

export default async function NewVehiclePage() {
  await requireAdmin();
  const [t, catalog] = await Promise.all([getTranslator(), listVehicleCatalog()]);
  return (
    <div className="mx-auto max-w-2xl p-4 pb-10">
      <h1 className="mb-4 text-xl font-bold text-slate-900">{t('add_vehicle')}</h1>
      <VehicleForm isAdmin catalog={catalog} />
    </div>
  );
}
