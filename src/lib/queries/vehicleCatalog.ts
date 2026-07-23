import { createClient } from '@/lib/supabase/server';
import type { VehicleCatalogEntry } from '../../../types/database.types';

/** Full brand/model catalog, used client-side to drive the Add Vehicle
 * brand/model suggestions (filtered by vehicle type as the user picks). */
export async function listVehicleCatalog(): Promise<VehicleCatalogEntry[]> {
  const supabase = await createClient();
  const { data } = await supabase.from('vehicle_catalog').select('id, vehicle_type, brand, model, created_at');
  return (data ?? []) as VehicleCatalogEntry[];
}
