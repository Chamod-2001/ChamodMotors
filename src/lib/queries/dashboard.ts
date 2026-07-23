import { createClient } from '@/lib/supabase/server';
import type { VehicleStatus, VehicleType } from '../../../types/database.types';
import { currentMonthValue, monthToRange, todayRange, calculateGrossProfit } from '@/lib/calculations';

export interface DashboardStats {
  availableBikeCount: number;
  availableThreeWheelerCount: number;
  reservedCount: number;
  soldCount: number;
  monthlySalesCount: number;
  monthlyProfit: number;
  todaysSalesCount: number;
  todaysProfit: number;
  totalRevenue: number;
  totalProfit: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();
  const { start: monthStart, end: monthEnd } = monthToRange(currentMonthValue());
  const { start: todayStart, end: todayEnd } = todayRange();

  const vehicleCount = async (status: VehicleStatus, types?: VehicleType[]) => {
    let query = supabase.from('vehicles').select('*', { count: 'exact', head: true }).eq('status', status);
    if (types) query = query.in('vehicle_type', types);
    const { count } = await query;
    return count ?? 0;
  };

  const [
    availableBikeCount,
    availableThreeWheelerCount,
    reservedCount,
    soldCount,
    monthlySales,
    todaysSales,
    allSales,
  ] = await Promise.all([
    vehicleCount('available', ['motorcycle', 'scooter', 'other']),
    vehicleCount('available', ['three_wheeler']),
    vehicleCount('reserved'),
    vehicleCount('sold'),
    supabase
      .from('sales')
      .select('sale_price, vehicles(buying_price)')
      .gte('purchase_date', monthStart)
      .lt('purchase_date', monthEnd),
    supabase
      .from('sales')
      .select('sale_price, vehicles(buying_price)')
      .gte('purchase_date', todayStart)
      .lt('purchase_date', todayEnd),
    supabase.from('sales').select('sale_price, vehicles(buying_price)'),
  ]);

  type SaleRow = { sale_price: number; vehicles: { buying_price: number } | { buying_price: number }[] | null };
  const monthlySaleRows = (monthlySales.data ?? []) as SaleRow[];
  const todaysSaleRows = (todaysSales.data ?? []) as SaleRow[];
  const allSaleRows = (allSales.data ?? []) as SaleRow[];

  const sumProfit = (rows: SaleRow[]) =>
    rows.reduce((sum, row) => {
      const vehicle = Array.isArray(row.vehicles) ? row.vehicles[0] : row.vehicles;
      return sum + calculateGrossProfit(row.sale_price, vehicle?.buying_price ?? 0);
    }, 0);

  const totalRevenue = allSaleRows.reduce((sum, row) => sum + Number(row.sale_price), 0);

  return {
    availableBikeCount,
    availableThreeWheelerCount,
    reservedCount,
    soldCount,
    monthlySalesCount: monthlySaleRows.length,
    monthlyProfit: sumProfit(monthlySaleRows),
    todaysSalesCount: todaysSaleRows.length,
    todaysProfit: sumProfit(todaysSaleRows),
    totalRevenue,
    totalProfit: sumProfit(allSaleRows),
  };
}

export interface RecentSaleRow {
  id: string;
  sale_price: number;
  purchase_date: string;
  vehicle_label: string;
  customer_name: string;
}

export async function getRecentSales(limit = 5): Promise<RecentSaleRow[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('sales')
    .select('id, sale_price, purchase_date, vehicles(brand, model), customers(full_name)')
    .order('purchase_date', { ascending: false })
    .limit(limit);

  type Row = {
    id: string;
    sale_price: number;
    purchase_date: string;
    vehicles: { brand: string; model: string } | { brand: string; model: string }[] | null;
    customers: { full_name: string } | { full_name: string }[] | null;
  };

  return ((data ?? []) as Row[]).map((row) => {
    const vehicle = Array.isArray(row.vehicles) ? row.vehicles[0] : row.vehicles;
    const customer = Array.isArray(row.customers) ? row.customers[0] : row.customers;
    return {
      id: row.id,
      sale_price: row.sale_price,
      purchase_date: row.purchase_date,
      vehicle_label: vehicle ? `${vehicle.brand} ${vehicle.model}` : '—',
      customer_name: customer?.full_name ?? '—',
    };
  });
}

export interface EmployeePerformanceRow {
  employeeId: string;
  fullName: string;
  salesCount: number;
}

export async function getEmployeePerformance(): Promise<EmployeePerformanceRow[]> {
  const supabase = await createClient();
  const { start: monthStart, end: monthEnd } = monthToRange(currentMonthValue());

  const { data } = await supabase
    .from('sales')
    .select('sold_by, profiles(full_name)')
    .gte('purchase_date', monthStart)
    .lt('purchase_date', monthEnd);

  type Row = { sold_by: string | null; profiles: { full_name: string } | { full_name: string }[] | null };
  const rows = (data ?? []) as Row[];

  const tally = new Map<string, EmployeePerformanceRow>();
  for (const row of rows) {
    if (!row.sold_by) continue;
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    const existing = tally.get(row.sold_by);
    if (existing) {
      existing.salesCount += 1;
    } else {
      tally.set(row.sold_by, {
        employeeId: row.sold_by,
        fullName: profile?.full_name ?? 'Unknown',
        salesCount: 1,
      });
    }
  }

  return Array.from(tally.values()).sort((a, b) => b.salesCount - a.salesCount);
}
