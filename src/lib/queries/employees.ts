import { createClient } from '@/lib/supabase/server';

export interface EmployeeRow {
  id: string;
  full_name: string;
  username: string;
  phone: string | null;
  role: 'admin' | 'sales';
  is_active: boolean;
  created_at: string;
}

export async function listEmployees(): Promise<EmployeeRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, username, phone, role, is_active, created_at')
    .order('created_at', { ascending: true });

  return (data ?? []) as EmployeeRow[];
}
