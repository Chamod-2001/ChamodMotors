import { createClient } from '@/lib/supabase/server';
import type { ReminderStatus } from '../../../types/database.types';

export interface ReminderItem {
  id: string;
  title: string;
  note: string | null;
  dueAt: string;
  status: ReminderStatus;
  vehicleLabel: string | null;
  customerName: string | null;
  officerName: string | null;
  createdByName: string | null;
}

type Row = {
  id: string;
  title: string;
  note: string | null;
  due_at: string;
  status: ReminderStatus;
  vehicles: { brand: string; model: string; registration_number: string | null } | { brand: string; model: string; registration_number: string | null }[] | null;
  customers: { full_name: string } | { full_name: string }[] | null;
  finance_officers: { officer_name: string } | { officer_name: string }[] | null;
  profiles: { full_name: string } | { full_name: string }[] | null;
};

const one = <T,>(v: T | T[] | null): T | null => (Array.isArray(v) ? v[0] ?? null : v);

const SELECT =
  'id, title, note, due_at, status, vehicles(brand, model, registration_number), customers(full_name), finance_officers(officer_name), profiles(full_name)';

function mapRow(row: Row): ReminderItem {
  const vehicle = one(row.vehicles);
  const customer = one(row.customers);
  const officer = one(row.finance_officers);
  const creator = one(row.profiles);

  return {
    id: row.id,
    title: row.title,
    note: row.note,
    dueAt: row.due_at,
    status: row.status,
    vehicleLabel: vehicle
      ? `${vehicle.brand} ${vehicle.model}${vehicle.registration_number ? ` (${vehicle.registration_number})` : ''}`
      : null,
    customerName: customer?.full_name ?? null,
    officerName: officer?.officer_name ?? null,
    createdByName: creator?.full_name ?? null,
  };
}

/** Every pending reminder, soonest due first — the main Calendar page list. */
export async function listUpcomingReminders(limit = 200): Promise<ReminderItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('reminders')
    .select(SELECT)
    .eq('status', 'pending')
    .order('due_at', { ascending: true })
    .limit(limit);

  return ((data ?? []) as unknown as Row[]).map(mapRow);
}

/** Reminders tagged to a specific vehicle/customer/finance officer record. */
export async function listReminders({
  vehicleId,
  customerId,
  financeOfficerId,
}: {
  vehicleId?: string;
  customerId?: string;
  financeOfficerId?: string;
}): Promise<ReminderItem[]> {
  const supabase = await createClient();
  let query = supabase.from('reminders').select(SELECT).eq('status', 'pending').order('due_at', { ascending: true });

  if (vehicleId) query = query.eq('vehicle_id', vehicleId);
  if (customerId) query = query.eq('customer_id', customerId);
  if (financeOfficerId) query = query.eq('finance_officer_id', financeOfficerId);

  const { data } = await query;
  return ((data ?? []) as unknown as Row[]).map(mapRow);
}

/** Count of all pending (not yet done/dismissed) reminders — drives the header Calendar icon badge. */
export async function countPendingReminders(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase.from('reminders').select('*', { count: 'exact', head: true }).eq('status', 'pending');
  return count ?? 0;
}
