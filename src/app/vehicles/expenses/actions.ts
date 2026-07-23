'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/queries/session';
import { validateVehicleExpenseInput } from '@/lib/validation';
import { logActivity } from '@/lib/activity';
import type { VehicleExpenseType } from '../../../../types/database.types';

export interface VehicleExpenseActionResult {
  error?: string;
}

const EXPENSE_TYPES: VehicleExpenseType[] = ['paint', 'upholstery', 'parts', 'labor', 'cleaning', 'other'];

/** Logging a reconditioning cost changes the vehicle's profit figure, so —
 * same as buying_price — this is admin-only, not open to every employee. */
export async function addVehicleExpenseAction(vehicleId: string, formData: FormData): Promise<VehicleExpenseActionResult> {
  await requireAdmin();

  const expenseTypeRaw = String(formData.get('expense_type') || 'other');
  const expenseType = (EXPENSE_TYPES as string[]).includes(expenseTypeRaw) ? (expenseTypeRaw as VehicleExpenseType) : 'other';
  const amount = Number(formData.get('amount') || 0);
  const description = String(formData.get('description') || '').trim();
  const receiptPath = String(formData.get('receiptPath') || '').trim();

  const validationError = validateVehicleExpenseInput({ amount });
  if (validationError) return { error: validationError };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: vehicle } = await supabase.from('vehicles').select('brand, model').eq('id', vehicleId).single();

  const { error } = await supabase.from('vehicle_expenses').insert({
    vehicle_id: vehicleId,
    expense_type: expenseType,
    amount,
    description: description || null,
    receipt_photo_path: receiptPath || null,
    created_by: user?.id ?? null,
  });

  if (error) {
    return { error: 'Expense save කරන්න බැරි වුණා. නැවත උත්සාහ කරන්න.' };
  }

  if (vehicle) {
    await logActivity(user?.id ?? null, 'vehicle_expense_added', `${vehicle.brand} ${vehicle.model} — ${expenseType}`);
  }

  revalidatePath(`/vehicles/${vehicleId}`);
  return {};
}

export async function deleteVehicleExpenseAction(expenseId: string, vehicleId: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { data: expense } = await supabase
    .from('vehicle_expenses')
    .select('receipt_photo_path')
    .eq('id', expenseId)
    .single();

  if (expense?.receipt_photo_path) {
    await supabase.storage.from('documents').remove([expense.receipt_photo_path]);
  }

  await supabase.from('vehicle_expenses').delete().eq('id', expenseId);

  revalidatePath(`/vehicles/${vehicleId}`);
}
