'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/queries/session';
import { logActivity } from '@/lib/activity';
import type { ReminderStatus } from '../../../types/database.types';

export interface ReminderActionResult {
  error?: string;
}

/** Any active employee can add a reminder, optionally tagged to a vehicle/customer/finance officer. */
export async function createReminderAction(formData: FormData): Promise<ReminderActionResult> {
  const title = String(formData.get('title') || '').trim();
  const dueDate = String(formData.get('due_date') || '');
  const dueTime = String(formData.get('due_time') || '09:00');
  const note = String(formData.get('note') || '').trim();
  const vehicleId = String(formData.get('vehicle_id') || '') || null;
  const customerId = String(formData.get('customer_id') || '') || null;
  const financeOfficerId = String(formData.get('finance_officer_id') || '') || null;

  if (!title) return { error: 'මාතෘකාවක් දෙන්න / Please enter a title' };

  const dueAt = new Date(`${dueDate}T${dueTime}:00`);
  if (!dueDate || Number.isNaN(dueAt.getTime())) return { error: 'දිනයක් තෝරන්න / Please pick a valid due date' };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from('reminders').insert({
    title,
    note: note || null,
    due_at: dueAt.toISOString(),
    vehicle_id: vehicleId,
    customer_id: customerId,
    finance_officer_id: financeOfficerId,
    created_by: user?.id ?? null,
  });

  if (error) return { error: 'Reminder save කරන්න බැරි වුණා. නැවත උත්සාහ කරන්න.' };

  await logActivity(user?.id ?? null, 'reminder_created', title);

  revalidatePath('/calendar');
  return {};
}

/** Any active employee can mark their own or a shared reminder done/dismissed. */
export async function updateReminderStatusAction(reminderId: string, status: ReminderStatus, revalidatePaths: string[]) {
  const supabase = await createClient();
  await supabase.from('reminders').update({ status }).eq('id', reminderId);
  for (const path of revalidatePaths) revalidatePath(path);
}

/** Only admins can permanently delete a reminder. */
export async function deleteReminderAction(reminderId: string, revalidatePaths: string[]) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from('reminders').delete().eq('id', reminderId);
  for (const path of revalidatePaths) revalidatePath(path);
}
