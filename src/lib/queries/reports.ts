import { createClient } from '@/lib/supabase/server';
import type { VehicleStatus } from '../../../types/database.types';
import { currentMonthValue, monthToRange, calculateGrossProfit } from '@/lib/calculations';

export { currentMonthValue };

// ------------------------------------------------------------
// Monthly Sales Report
// ------------------------------------------------------------
export interface SalesReportRow {
  id: string;
  purchase_date: string;
  vehicle_label: string;
  customer_name: string;
  sold_by_name: string | null;
  sale_price: number;
}

export async function getMonthlySalesReport(month: string) {
  const supabase = await createClient();
  const { start, end } = monthToRange(month);

  const { data } = await supabase
    .from('sales')
    .select('id, purchase_date, sale_price, vehicles(brand, model), customers(full_name), profiles(full_name)')
    .gte('purchase_date', start)
    .lt('purchase_date', end)
    .order('purchase_date', { ascending: false });

  type Row = {
    id: string;
    purchase_date: string;
    sale_price: number;
    vehicles: { brand: string; model: string } | { brand: string; model: string }[] | null;
    customers: { full_name: string } | { full_name: string }[] | null;
    profiles: { full_name: string } | { full_name: string }[] | null;
  };
  const one = <T,>(v: T | T[] | null): T | null => (Array.isArray(v) ? v[0] ?? null : v);

  const rows: SalesReportRow[] = ((data ?? []) as unknown as Row[]).map((r) => {
    const vehicle = one(r.vehicles);
    const customer = one(r.customers);
    const seller = one(r.profiles);
    return {
      id: r.id,
      purchase_date: r.purchase_date,
      vehicle_label: vehicle ? `${vehicle.brand} ${vehicle.model}` : '—',
      customer_name: customer?.full_name ?? '—',
      sold_by_name: seller?.full_name ?? null,
      sale_price: r.sale_price,
    };
  });

  const totalRevenue = rows.reduce((sum, r) => sum + Number(r.sale_price), 0);
  return { rows, totalCount: rows.length, totalRevenue };
}

// ------------------------------------------------------------
// Monthly Profit Report
// ------------------------------------------------------------
export interface ProfitReportRow {
  id: string;
  purchase_date: string;
  vehicle_label: string;
  buying_price: number;
  sale_price: number;
  profit: number;
}

export async function getMonthlyProfitReport(month: string) {
  const supabase = await createClient();
  const { start, end } = monthToRange(month);

  const { data } = await supabase
    .from('sales')
    .select('id, purchase_date, sale_price, vehicles(brand, model, buying_price)')
    .gte('purchase_date', start)
    .lt('purchase_date', end)
    .order('purchase_date', { ascending: false });

  type Row = {
    id: string;
    purchase_date: string;
    sale_price: number;
    vehicles:
      | { brand: string; model: string; buying_price: number }
      | { brand: string; model: string; buying_price: number }[]
      | null;
  };
  const one = <T,>(v: T | T[] | null): T | null => (Array.isArray(v) ? v[0] ?? null : v);

  const rows: ProfitReportRow[] = ((data ?? []) as unknown as Row[]).map((r) => {
    const vehicle = one(r.vehicles);
    const buyingPrice = vehicle?.buying_price ?? 0;
    return {
      id: r.id,
      purchase_date: r.purchase_date,
      vehicle_label: vehicle ? `${vehicle.brand} ${vehicle.model}` : '—',
      buying_price: buyingPrice,
      sale_price: r.sale_price,
      profit: calculateGrossProfit(r.sale_price, buyingPrice),
    };
  });

  const totalProfit = rows.reduce((sum, r) => sum + r.profit, 0);
  return { rows, totalProfit };
}

// ------------------------------------------------------------
// Vehicle Inventory Report
// ------------------------------------------------------------
export interface InventoryReportSummary {
  status: VehicleStatus;
  count: number;
  totalBuyingValue: number;
  totalSellingValue: number;
}

export async function getInventoryReport() {
  const supabase = await createClient();
  const { data } = await supabase.from('vehicles').select('status, buying_price, selling_price');

  type Row = { status: string; buying_price: number; selling_price: number };
  const rows = (data ?? []) as Row[];

  const statuses: VehicleStatus[] = ['available', 'reserved', 'sold'];
  const summary: InventoryReportSummary[] = statuses.map((status) => {
    const matching = rows.filter((r) => r.status === status);
    return {
      status,
      count: matching.length,
      totalBuyingValue: matching.reduce((s, r) => s + Number(r.buying_price), 0),
      totalSellingValue: matching.reduce((s, r) => s + Number(r.selling_price), 0),
    };
  });

  return summary;
}

// ------------------------------------------------------------
// Customer Purchase Report
// ------------------------------------------------------------
export interface CustomerPurchaseReportRow {
  customerId: string;
  fullName: string;
  purchaseCount: number;
  totalSpent: number;
}

export async function getCustomerPurchaseReport() {
  const supabase = await createClient();
  const { data } = await supabase.from('sales').select('sale_price, customers(id, full_name)');

  type Row = {
    sale_price: number;
    customers: { id: string; full_name: string } | { id: string; full_name: string }[] | null;
  };
  const one = <T,>(v: T | T[] | null): T | null => (Array.isArray(v) ? v[0] ?? null : v);

  const tally = new Map<string, CustomerPurchaseReportRow>();
  for (const row of (data ?? []) as unknown as Row[]) {
    const customer = one(row.customers);
    if (!customer) continue;
    const existing = tally.get(customer.id);
    if (existing) {
      existing.purchaseCount += 1;
      existing.totalSpent += Number(row.sale_price);
    } else {
      tally.set(customer.id, {
        customerId: customer.id,
        fullName: customer.full_name,
        purchaseCount: 1,
        totalSpent: Number(row.sale_price),
      });
    }
  }

  return Array.from(tally.values()).sort((a, b) => b.totalSpent - a.totalSpent);
}

// ------------------------------------------------------------
// Employee Sales Report
// ------------------------------------------------------------
export interface EmployeeSalesReportRow {
  employeeId: string;
  fullName: string;
  salesCount: number;
  totalRevenue: number;
  totalProfit: number;
}

export async function getEmployeeSalesReport(month: string) {
  const supabase = await createClient();
  const { start, end } = monthToRange(month);

  const { data } = await supabase
    .from('sales')
    .select('sale_price, sold_by, profiles(id, full_name), vehicles(buying_price)')
    .gte('purchase_date', start)
    .lt('purchase_date', end);

  type Row = {
    sale_price: number;
    sold_by: string | null;
    profiles: { id: string; full_name: string } | { id: string; full_name: string }[] | null;
    vehicles: { buying_price: number } | { buying_price: number }[] | null;
  };
  const one = <T,>(v: T | T[] | null): T | null => (Array.isArray(v) ? v[0] ?? null : v);

  const tally = new Map<string, EmployeeSalesReportRow>();
  for (const row of (data ?? []) as unknown as Row[]) {
    if (!row.sold_by) continue;
    const employee = one(row.profiles);
    const vehicle = one(row.vehicles);
    const profit = calculateGrossProfit(row.sale_price, vehicle?.buying_price ?? 0);

    const existing = tally.get(row.sold_by);
    if (existing) {
      existing.salesCount += 1;
      existing.totalRevenue += Number(row.sale_price);
      existing.totalProfit += profit;
    } else {
      tally.set(row.sold_by, {
        employeeId: row.sold_by,
        fullName: employee?.full_name ?? 'Unknown',
        salesCount: 1,
        totalRevenue: Number(row.sale_price),
        totalProfit: profit,
      });
    }
  }

  return Array.from(tally.values()).sort((a, b) => b.totalRevenue - a.totalRevenue);
}
