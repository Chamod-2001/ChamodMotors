import { createClient } from '@/lib/supabase/server';

export interface CustomerListItem {
  id: string;
  full_name: string;
  nic_number: string;
  phone_number: string;
  photo_path: string | null;
  vehicles_purchased: number;
}

export async function listCustomers(query?: string): Promise<CustomerListItem[]> {
  const supabase = await createClient();

  let request = supabase
    .from('customers')
    .select('id, full_name, nic_number, phone_number, photo_path, sales(id)')
    .order('created_at', { ascending: false });

  if (query?.trim()) {
    const q = query.trim();
    request = request.or(`full_name.ilike.%${q}%,phone_number.ilike.%${q}%,nic_number.ilike.%${q}%`);
  }

  const { data, error } = await request;
  if (error) throw error;

  type Row = {
    id: string;
    full_name: string;
    nic_number: string;
    phone_number: string;
    photo_path: string | null;
    sales: { id: string }[] | null;
  };

  return ((data ?? []) as Row[]).map((row) => ({
    id: row.id,
    full_name: row.full_name,
    nic_number: row.nic_number,
    phone_number: row.phone_number,
    photo_path: row.photo_path,
    vehicles_purchased: row.sales?.length ?? 0,
  }));
}

export interface CustomerDetail {
  id: string;
  full_name: string;
  nic_number: string;
  phone_number: string;
  address: string | null;
  occupation: string | null;
  photo_path: string | null;
}

export async function getCustomer(id: string): Promise<CustomerDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('customers')
    .select('id, full_name, nic_number, phone_number, address, occupation, photo_path')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data as CustomerDetail;
}

export interface PurchaseHistoryItem {
  saleId: string;
  vehicleId: string;
  vehicleLabel: string;
  salePrice: number;
  purchaseDate: string;
}

export async function getCustomerPurchaseHistory(customerId: string): Promise<PurchaseHistoryItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('sales')
    .select('id, sale_price, purchase_date, vehicles(id, brand, model, registration_number)')
    .eq('customer_id', customerId)
    .order('purchase_date', { ascending: false });

  type Row = {
    id: string;
    sale_price: number;
    purchase_date: string;
    vehicles:
      | { id: string; brand: string; model: string; registration_number: string | null }
      | { id: string; brand: string; model: string; registration_number: string | null }[]
      | null;
  };

  return ((data ?? []) as Row[]).map((row) => {
    const vehicle = Array.isArray(row.vehicles) ? row.vehicles[0] : row.vehicles;
    return {
      saleId: row.id,
      vehicleId: vehicle?.id ?? '',
      vehicleLabel: vehicle ? `${vehicle.brand} ${vehicle.model}${vehicle.registration_number ? ` (${vehicle.registration_number})` : ''}` : '—',
      salePrice: row.sale_price,
      purchaseDate: row.purchase_date,
    };
  });
}

export interface SellableVehicle {
  id: string;
  label: string;
  selling_price: number;
}

/** Vehicles available or reserved — eligible to be sold to a customer */
export async function listSellableVehicles(): Promise<SellableVehicle[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('vehicles')
    .select('id, brand, model, registration_number, selling_price')
    .in('status', ['available', 'reserved'])
    .order('brand', { ascending: true });

  type Row = { id: string; brand: string; model: string; registration_number: string | null; selling_price: number };

  return ((data ?? []) as Row[]).map((row) => ({
    id: row.id,
    label: `${row.brand} ${row.model}${row.registration_number ? ` — ${row.registration_number}` : ''}`,
    selling_price: row.selling_price,
  }));
}
