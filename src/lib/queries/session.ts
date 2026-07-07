import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export interface CurrentEmployee {
  id: string;
  name: string;
  role: string;
}

// Memoized per-request: AppShell and individual pages both need the current
// user/role, so without this every page did the auth+profile round trip
// twice (once for the header, once for its own isAdmin check), adding a
// couple hundred ms of sequential network latency to every navigation.
export const getCurrentEmployee = cache(async (): Promise<CurrentEmployee | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase.from('profiles').select('full_name, role').eq('id', user.id).single();

  return {
    id: user.id,
    name: profile?.full_name ?? user.email ?? '',
    role: profile?.role ?? 'sales',
  };
});

// Finance officer/company management and profit figures are admin-only;
// sales employees can view vehicles/customers and contact finance officers
// but must not see buying prices or margins. Call at the top of any
// admin-only page so direct navigation to the URL is also blocked.
export async function requireAdmin(): Promise<CurrentEmployee> {
  const employee = await getCurrentEmployee();
  if (!employee || employee.role !== 'admin') {
    redirect('/dashboard');
  }
  return employee;
}
