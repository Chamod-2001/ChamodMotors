import { createAdminClient } from '@/lib/supabase/admin';
import type { ActivityType } from '../../types/database.types';

// Fire-and-forget: activity logging must never break the action it's
// attached to, so failures are swallowed (and reported to the console).
export async function logActivity(employeeId: string | null, type: ActivityType, description: string) {
  try {
    const admin = createAdminClient();
    await admin.from('activity_log').insert({ employee_id: employeeId, activity_type: type, description });
  } catch (err) {
    console.error('Failed to log activity', err);
  }
}
