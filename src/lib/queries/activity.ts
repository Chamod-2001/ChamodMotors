import { createClient } from '@/lib/supabase/server';
import type { ActivityType } from '../../../types/database.types';

export interface ActivityRow {
  id: string;
  employeeId: string | null;
  activityType: ActivityType;
  description: string;
  createdAt: string;
}

export interface ActivitySession {
  loginAt: string | null;
  logoutAt: string | null;
  ongoing: boolean;
  items: ActivityRow[];
}

export interface EmployeeActivityGroup {
  employeeId: string;
  employeeName: string;
  username: string;
  role: string;
  lastActivityAt: string;
  sessions: ActivitySession[];
}

type Row = {
  id: string;
  employee_id: string | null;
  activity_type: ActivityType;
  description: string;
  created_at: string;
  profiles:
    | { full_name: string; username: string; role: string }
    | { full_name: string; username: string; role: string }[]
    | null;
};

export async function listActivityGroupedByEmployee(limit = 500): Promise<EmployeeActivityGroup[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('activity_log')
    .select('id, employee_id, activity_type, description, created_at, profiles(full_name, username, role)')
    .order('created_at', { ascending: true })
    .limit(limit);

  const rows = (data ?? []) as Row[];

  const byEmployee = new Map<string, { employeeName: string; username: string; role: string; rows: ActivityRow[] }>();

  for (const row of rows) {
    const employeeId = row.employee_id ?? 'unknown';
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;

    if (!byEmployee.has(employeeId)) {
      byEmployee.set(employeeId, {
        employeeName: profile?.full_name ?? 'Unknown',
        username: profile?.username ?? '—',
        role: profile?.role ?? 'sales',
        rows: [],
      });
    }

    byEmployee.get(employeeId)!.rows.push({
      id: row.id,
      employeeId: row.employee_id,
      activityType: row.activity_type,
      description: row.description,
      createdAt: row.created_at,
    });
  }

  const groups: EmployeeActivityGroup[] = [];

  for (const [employeeId, { employeeName, username, role, rows: items }] of byEmployee) {
    // Bucket each employee's chronological activity into sessions bounded
    // by login → ...actions... → logout, so admins can read "what did they
    // do during this visit" instead of one flat interleaved timeline.
    const sessions: ActivitySession[] = [];
    let current: ActivitySession | null = null;

    for (const item of items) {
      if (item.activityType === 'login') {
        current = { loginAt: item.createdAt, logoutAt: null, ongoing: true, items: [item] };
        sessions.push(current);
        continue;
      }
      if (!current) {
        current = { loginAt: null, logoutAt: null, ongoing: true, items: [] };
        sessions.push(current);
      }
      current.items.push(item);
      if (item.activityType === 'logout') {
        current.logoutAt = item.createdAt;
        current.ongoing = false;
        current = null;
      }
    }

    sessions.reverse();
    for (const session of sessions) session.items.reverse();

    groups.push({
      employeeId,
      employeeName,
      username,
      role,
      lastActivityAt: items[items.length - 1].createdAt,
      sessions,
    });
  }

  groups.sort((a, b) => (a.lastActivityAt < b.lastActivityAt ? 1 : -1));

  return groups;
}

export async function getUnreadActivityCount(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from('activity_log')
    .select('*', { count: 'exact', head: true })
    .is('read_at', null);
  return count ?? 0;
}
