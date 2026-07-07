'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/queries/session';

export async function markActivityReadAction() {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from('activity_log').update({ read_at: new Date().toISOString() }).is('read_at', null);
  revalidatePath('/', 'layout');
}
