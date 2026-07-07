'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { AuthResult } from '../login/actions';
import { validateNewPassword } from '@/lib/validation';

export async function updatePasswordAction(formData: FormData): Promise<AuthResult> {
  const password = String(formData.get('password') || '');
  const confirmPassword = String(formData.get('confirmPassword') || '');

  const validationError = validateNewPassword(password, confirmPassword);
  if (validationError) return { error: validationError };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: 'Password update කරන්න බැරි වුණා. නැවත උත්සාහ කරන්න.' };
  }

  redirect('/dashboard');
}
