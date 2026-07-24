import { createClient } from '@/lib/supabase/server';

export interface EmployeeRow {
  id: string;
  full_name: string;
  username: string;
  phone: string | null;
  role: 'admin' | 'sales';
  is_active: boolean;
  photo_path: string | null;
  created_at: string;
}

export async function listEmployees(): Promise<EmployeeRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, username, phone, role, is_active, photo_path, created_at')
    .order('created_at', { ascending: true });

  return (data ?? []) as EmployeeRow[];
}

/**
 * "Online" here means: this employee's most recent login/logout event is a
 * login with no logout after it. There's no real-time presence/heartbeat in
 * this app, so a browser closed without an explicit logout will still show
 * as online until their next login — an approximation, not a live socket.
 */
export async function listOnlineEmployeeIds(): Promise<Set<string>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('activity_log')
    .select('employee_id, activity_type, created_at')
    .in('activity_type', ['login', 'logout'])
    .not('employee_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1000);

  const seen = new Set<string>();
  const online = new Set<string>();

  for (const row of data ?? []) {
    const employeeId = row.employee_id as string;
    if (seen.has(employeeId)) continue;
    seen.add(employeeId);
    if (row.activity_type === 'login') online.add(employeeId);
  }

  return online;
}
