import { createClient } from '@/lib/supabase/server';
import type { VehicleExpenseType } from '../../../types/database.types';

export interface VehicleExpenseItem {
  id: string;
  expenseType: VehicleExpenseType;
  amount: number;
  description: string | null;
  receiptSignedUrl: string | null;
  createdByName: string | null;
  createdAt: string;
}

type Row = {
  id: string;
  expense_type: VehicleExpenseType;
  amount: number;
  description: string | null;
  receipt_photo_path: string | null;
  created_at: string;
  profiles: { full_name: string } | { full_name: string }[] | null;
};

const one = <T,>(v: T | T[] | null): T | null => (Array.isArray(v) ? v[0] ?? null : v);

/** Itemized reconditioning costs (paint, upholstery, parts, labor...) for a
 * vehicle — these feed into vehicles.total_expenses (trigger-maintained) and
 * therefore into gross_profit. */
export async function listVehicleExpenses(vehicleId: string): Promise<VehicleExpenseItem[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('vehicle_expenses')
    .select('id, expense_type, amount, description, receipt_photo_path, created_at, profiles(full_name)')
    .eq('vehicle_id', vehicleId)
    .order('created_at', { ascending: false });

  const rows = (data ?? []) as unknown as Row[];

  const signedUrls = await Promise.all(
    rows.map((row) =>
      row.receipt_photo_path ? supabase.storage.from('documents').createSignedUrl(row.receipt_photo_path, 3600) : null
    )
  );

  return rows.map((row, i) => ({
    id: row.id,
    expenseType: row.expense_type,
    amount: row.amount,
    description: row.description,
    receiptSignedUrl: signedUrls[i]?.data?.signedUrl ?? null,
    createdByName: one(row.profiles)?.full_name ?? null,
    createdAt: row.created_at,
  }));
}
