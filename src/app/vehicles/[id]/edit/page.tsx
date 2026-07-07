import { notFound } from 'next/navigation';
import { getVehicle } from '@/lib/queries/vehicles';
import { VehicleForm } from '@/components/vehicles/VehicleForm';
import { getTranslator } from '@/lib/i18n/server';

export default async function EditVehiclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vehicle = await getVehicle(id);
  if (!vehicle) notFound();
  const t = await getTranslator();

  return (
    <div className="mx-auto max-w-2xl p-4 pb-10">
      <h1 className="mb-4 text-xl font-bold text-slate-900">
        {t('edit')} {t('vehicle')}
      </h1>
      <VehicleForm vehicle={vehicle} />
    </div>
  );
}
