import { createClient } from '@/lib/supabase/server';
import { normalizePlateNumber } from '@/lib/format';
import type { VehicleStatus } from '../../../types/database.types';

export interface VehicleListItem {
  id: string;
  brand: string;
  model: string;
  manufacturing_year: number | null;
  registration_number: string | null;
  selling_price: number;
  status: VehicleStatus;
  primary_image_path: string | null;
  buying_date: string;
  reserved_at: string | null;
  sold_at: string | null;
}

export async function listVehicles(filters?: { status?: VehicleStatus; query?: string }) {
  const supabase = await createClient();

  let request = supabase
    .from('vehicles')
    .select(
      'id, brand, model, manufacturing_year, registration_number, selling_price, status, buying_date, reserved_at, sold_at, vehicle_images(storage_path, is_primary)'
    )
    .order('created_at', { ascending: false });

  if (filters?.status) {
    request = request.eq('status', filters.status);
  }
  if (filters?.query) {
    const q = filters.query.trim();
    const normalized = normalizePlateNumber(q);
    request = request.or(
      `brand.ilike.%${q}%,model.ilike.%${q}%,registration_number_normalized.ilike.%${normalized}%,engine_number_normalized.ilike.%${normalized}%,chassis_number_normalized.ilike.%${normalized}%`
    );
  }

  const { data, error } = await request;
  if (error) throw error;

  type Row = {
    id: string;
    brand: string;
    model: string;
    manufacturing_year: number | null;
    registration_number: string | null;
    selling_price: number;
    status: string;
    buying_date: string;
    reserved_at: string | null;
    sold_at: string | null;
    vehicle_images: { storage_path: string; is_primary: boolean }[] | null;
  };

  return ((data ?? []) as Row[]).map((row): VehicleListItem => {
    const images = row.vehicle_images ?? [];
    const primary = images.find((img) => img.is_primary) ?? images[0];
    return {
      id: row.id,
      brand: row.brand,
      model: row.model,
      manufacturing_year: row.manufacturing_year,
      registration_number: row.registration_number,
      selling_price: row.selling_price,
      status: row.status as VehicleStatus,
      primary_image_path: primary?.storage_path ?? null,
      buying_date: row.buying_date,
      reserved_at: row.reserved_at,
      sold_at: row.sold_at,
    };
  });
}

export interface VehicleDetail {
  id: string;
  brand: string;
  model: string;
  manufacturing_year: number | null;
  vehicle_type: string;
  registration_number: string | null;
  engine_number: string | null;
  chassis_number: string | null;
  mileage: number | null;
  fuel_type: string | null;
  color: string | null;
  buying_price: number;
  selling_price: number;
  total_expenses: number;
  gross_profit: number;
  status: VehicleStatus;
  notes: string | null;
  buying_date: string;
  reserved_at: string | null;
  sold_at: string | null;
  seller_name: string | null;
  seller_nic_number: string | null;
  seller_phone_number: string | null;
  images: { id: string; storage_path: string; is_primary: boolean }[];
}

export async function getVehicle(id: string): Promise<VehicleDetail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('vehicles')
    .select(
      'id, brand, model, manufacturing_year, vehicle_type, registration_number, engine_number, chassis_number, mileage, fuel_type, color, buying_price, selling_price, total_expenses, gross_profit, status, notes, buying_date, reserved_at, sold_at, seller_name, seller_nic_number, seller_phone_number, vehicle_images(id, storage_path, is_primary, sort_order)'
    )
    .eq('id', id)
    .single();

  if (error || !data) return null;

  type Row = Omit<VehicleDetail, 'images' | 'status'> & {
    status: string;
    vehicle_images: { id: string; storage_path: string; is_primary: boolean; sort_order: number }[] | null;
  };
  const row = data as Row;

  return {
    ...row,
    status: row.status as VehicleStatus,
    images: (row.vehicle_images ?? []).sort((a, b) => a.sort_order - b.sort_order),
  };
}

export interface VehicleSaleInfo {
  customerName: string;
  customerNic: string;
  customerPhone: string;
  salePrice: number;
  purchaseDate: string;
  soldByName: string | null;
}

/** Who a vehicle was sold to and for how much — the "Sold To" counterpart
 * of the vehicle's seller_* fields (who it was bought from). */
export async function getVehicleSaleInfo(vehicleId: string): Promise<VehicleSaleInfo | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('sales')
    .select('sale_price, purchase_date, customers(full_name, nic_number, phone_number), profiles(full_name)')
    .eq('vehicle_id', vehicleId)
    .order('purchase_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;

  type Row = {
    sale_price: number;
    purchase_date: string;
    customers: { full_name: string; nic_number: string; phone_number: string } | { full_name: string; nic_number: string; phone_number: string }[] | null;
    profiles: { full_name: string } | { full_name: string }[] | null;
  };
  const row = data as unknown as Row;
  const customer = Array.isArray(row.customers) ? row.customers[0] : row.customers;
  const soldBy = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
  if (!customer) return null;

  return {
    customerName: customer.full_name,
    customerNic: customer.nic_number,
    customerPhone: customer.phone_number,
    salePrice: row.sale_price,
    purchaseDate: row.purchase_date,
    soldByName: soldBy?.full_name ?? null,
  };
}
