'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/queries/session';

export interface EmployeeActionResult {
  error?: string;
}

const USERNAME_PATTERN = /^[a-z0-9_.]+$/;

export async function createEmployeeAction(formData: FormData): Promise<EmployeeActionResult> {
  await requireAdmin();

  const full_name = String(formData.get('full_name') || '').trim();
  const username = String(formData.get('username') || '').trim().toLowerCase();
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const role = String(formData.get('role') || 'sales');

  if (!full_name || !username || !email || !password) {
    return { error: 'නම, Username, Email සහ Password ඕන / Name, username, email and password are required' };
  }
  if (!USERNAME_PATTERN.test(username)) {
    return { error: 'Username - lowercase letters, numbers, dots and underscores only' };
  }
  if (password.length < 6) {
    return { error: 'Password අඩුම තරමින් අකුරු 6ක් ඕන / Password must be at least 6 characters' };
  }
  if (role !== 'admin' && role !== 'sales') {
    return { error: 'Invalid role' };
  }

  const admin = createAdminClient();

  const { data: existing } = await admin.from('profiles').select('id').eq('username', username).maybeSingle();
  if (existing) {
    return { error: 'මේ Username එක දැනටමත් තියෙනවා / This username is already taken' };
  }

  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, role, username },
  });

  if (error) {
    return {
      error: error.message.toLowerCase().includes('already been registered')
        ? 'මේ Email එක දැනටමත් register වෙලා / This email is already registered'
        : 'Employee create කරන්න බැරි වුණා. නැවත උත්සාහ කරන්න.',
    };
  }

  revalidatePath('/employees');
  redirect('/employees');
}

export async function setEmployeeActiveAction(employeeId: string, isActive: boolean) {
  await requireAdmin();

  const admin = createAdminClient();
  await admin.from('profiles').update({ is_active: isActive }).eq('id', employeeId);

  revalidatePath('/employees');
}

export async function updateEmployeePhotoAction(employeeId: string, photoPath: string): Promise<EmployeeActionResult> {
  await requireAdmin();

  const admin = createAdminClient();
  const { error } = await admin.from('profiles').update({ photo_path: photoPath || null }).eq('id', employeeId);

  if (error) return { error: 'Photo save කරන්න බැරි වුණා. නැවත උත්සාහ කරන්න.' };

  revalidatePath('/employees');
  return {};
}
