import { createClient } from '@/lib/supabase/server';
import type { EditRequestStatus, VehicleEditChanges } from '../../../types/database.types';

export interface VehicleEditRequestItem {
  id: string;
  vehicleId: string;
  vehicleLabel: string;
  status: EditRequestStatus;
  changes: VehicleEditChanges;
  requestedByName: string | null;
  reviewedByName: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

type Row = {
  id: string;
  vehicle_id: string;
  status: EditRequestStatus;
  changes: VehicleEditChanges;
  created_at: string;
  reviewed_at: string | null;
  vehicles: { brand: string; model: string; registration_number: string | null } | { brand: string; model: string; registration_number: string | null }[] | null;
  requester: { full_name: string } | { full_name: string }[] | null;
  reviewer: { full_name: string } | { full_name: string }[] | null;
};

const one = <T,>(v: T | T[] | null): T | null => (Array.isArray(v) ? v[0] ?? null : v);

const SELECT =
  'id, vehicle_id, status, changes, created_at, reviewed_at, vehicles(brand, model, registration_number), requester:requested_by(full_name), reviewer:reviewed_by(full_name)';

function mapRow(row: Row): VehicleEditRequestItem {
  const vehicle = one(row.vehicles);
  const requester = one(row.requester);
  const reviewer = one(row.reviewer);

  return {
    id: row.id,
    vehicleId: row.vehicle_id,
    vehicleLabel: vehicle
      ? `${vehicle.brand} ${vehicle.model}${vehicle.registration_number ? ` (${vehicle.registration_number})` : ''}`
      : '—',
    status: row.status,
    changes: row.changes,
    requestedByName: requester?.full_name ?? null,
    reviewedByName: reviewer?.full_name ?? null,
    createdAt: row.created_at,
    reviewedAt: row.reviewed_at,
  };
}

/** All pending requests across every vehicle — the admin Approvals page. */
export async function listPendingVehicleEditRequests(): Promise<VehicleEditRequestItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('vehicle_edit_requests')
    .select(SELECT)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  return ((data ?? []) as unknown as Row[]).map(mapRow);
}

/** Count of pending requests — drives the header approvals badge. */
export async function countPendingVehicleEditRequests(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from('vehicle_edit_requests')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');
  return count ?? 0;
}

/** The pending request for one vehicle (if any) — shown on that vehicle's own edit page. */
export async function getPendingRequestForVehicle(vehicleId: string): Promise<VehicleEditRequestItem | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('vehicle_edit_requests')
    .select(SELECT)
    .eq('vehicle_id', vehicleId)
    .eq('status', 'pending')
    .maybeSingle();

  return data ? mapRow(data as unknown as Row) : null;
}
