import { createClient } from '@/lib/supabase/server';
import { normalizePlateNumber } from '@/lib/format';

export interface SearchVehicleResult {
  id: string;
  label: string;
  registration_number: string | null;
  status: string;
}

export interface SearchCustomerResult {
  id: string;
  full_name: string;
  phone_number: string;
}

export async function searchAll(query: string): Promise<{
  vehicles: SearchVehicleResult[];
  customers: SearchCustomerResult[];
}> {
  const q = query.trim();
  if (!q) return { vehicles: [], customers: [] };

  const supabase = await createClient();
  const normalized = normalizePlateNumber(q);

  const [vehicleResult, customerResult] = await Promise.all([
    supabase
      .from('vehicles')
      .select('id, brand, model, registration_number, status')
      .eq('is_active', true)
      .or(
        `brand.ilike.%${q}%,model.ilike.%${q}%,registration_number_normalized.ilike.%${normalized}%,engine_number_normalized.ilike.%${normalized}%,chassis_number_normalized.ilike.%${normalized}%`
      )
      .limit(20),
    supabase
      .from('customers')
      .select('id, full_name, phone_number')
      .eq('is_active', true)
      .or(`full_name.ilike.%${q}%,phone_number.ilike.%${q}%`)
      .limit(20),
  ]);

  const vehicles = (vehicleResult.data ?? []).map((v) => ({
    id: v.id,
    label: `${v.brand} ${v.model}`,
    registration_number: v.registration_number,
    status: v.status,
  }));

  const customers = (customerResult.data ?? []).map((c) => ({
    id: c.id,
    full_name: c.full_name,
    phone_number: c.phone_number,
  }));

  return { vehicles, customers };
}
