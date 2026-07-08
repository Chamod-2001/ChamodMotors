'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/queries/session';
import { logActivity } from '@/lib/activity';
import type { EditRequestStatus, VehicleEditChanges, Vehicle } from '../../../../types/database.types';

export interface ApprovalActionResult {
  error?: string;
}

type RequestRow = {
  vehicle_id: string;
  changes: VehicleEditChanges;
  status: EditRequestStatus;
  vehicles: { brand: string; model: string } | { brand: string; model: string }[] | null;
};

const one = <T,>(v: T | T[] | null): T | null => (Array.isArray(v) ? v[0] ?? null : v);

export async function approveVehicleEditRequestAction(requestId: string): Promise<ApprovalActionResult> {
  await requireAdmin();
  const supabase = await createClient();

  const { data } = await supabase
    .from('vehicle_edit_requests')
    .select('vehicle_id, changes, status, vehicles(brand, model)')
    .eq('id', requestId)
    .single();

  const request = data as unknown as RequestRow | null;
  if (!request || request.status !== 'pending') {
    return { error: 'මේ request එක තවත් නැත, හෝ දැනටමත් review කර ඇත.' };
  }

  const updates: Record<string, string | number | null> = {};
  for (const [field, change] of Object.entries(request.changes)) {
    updates[field] = change.new;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error: updateError } = await supabase
    .from('vehicles')
    .update(updates as Partial<Vehicle>)
    .eq('id', request.vehicle_id);
  if (updateError) {
    return { error: 'වාහනය update කරන්න බැරි වුණා. නැවත උත්සාහ කරන්න.' };
  }

  await supabase
    .from('vehicle_edit_requests')
    .update({ status: 'approved', reviewed_by: user?.id ?? null, reviewed_at: new Date().toISOString() })
    .eq('id', requestId);

  const vehicle = one(request.vehicles);
  await logActivity(user?.id ?? null, 'vehicle_edit_approved', vehicle ? `${vehicle.brand} ${vehicle.model}` : '');

  revalidatePath('/vehicles/approvals');
  revalidatePath(`/vehicles/${request.vehicle_id}`);
  revalidatePath(`/vehicles/${request.vehicle_id}/edit`);
  revalidatePath('/vehicles');
  return {};
}

export async function rejectVehicleEditRequestAction(requestId: string): Promise<ApprovalActionResult> {
  await requireAdmin();
  const supabase = await createClient();

  const { data } = await supabase
    .from('vehicle_edit_requests')
    .select('vehicle_id, changes, status, vehicles(brand, model)')
    .eq('id', requestId)
    .single();

  const request = data as unknown as RequestRow | null;
  if (!request || request.status !== 'pending') {
    return { error: 'මේ request එක තවත් නැත, හෝ දැනටමත් review කර ඇත.' };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase
    .from('vehicle_edit_requests')
    .update({ status: 'rejected', reviewed_by: user?.id ?? null, reviewed_at: new Date().toISOString() })
    .eq('id', requestId);

  const vehicle = one(request.vehicles);
  await logActivity(user?.id ?? null, 'vehicle_edit_rejected', vehicle ? `${vehicle.brand} ${vehicle.model}` : '');

  revalidatePath('/vehicles/approvals');
  revalidatePath(`/vehicles/${request.vehicle_id}`);
  revalidatePath(`/vehicles/${request.vehicle_id}/edit`);
  return {};
}
