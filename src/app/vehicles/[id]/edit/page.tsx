import { notFound, redirect } from 'next/navigation';
import { getVehicle } from '@/lib/queries/vehicles';
import { getPendingRequestForVehicle } from '@/lib/queries/vehicleEditRequests';
import { VehicleForm } from '@/components/vehicles/VehicleForm';
import { getCurrentEmployee } from '@/lib/queries/session';
import { getTranslator } from '@/lib/i18n/server';

export default async function EditVehiclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [employee, vehicle, pendingRequest, t] = await Promise.all([
    getCurrentEmployee(),
    getVehicle(id),
    getPendingRequestForVehicle(id),
    getTranslator(),
  ]);

  if (!employee) redirect('/login');
  if (!vehicle) notFound();
  const isAdmin = employee.role === 'admin';

  return (
    <div className="mx-auto max-w-2xl p-4 pb-10">
      <h1 className="mb-4 text-xl font-bold text-slate-900">
        {t('edit')} {t('vehicle')}
      </h1>
      <VehicleForm vehicle={vehicle} isAdmin={isAdmin} pendingRequest={pendingRequest} />
    </div>
  );
}
