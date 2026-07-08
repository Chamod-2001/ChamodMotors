'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import { after } from 'next/server';
import { logActivity } from '@/lib/activity';

export interface AuthResult {
  error?: string;
}

const INVALID_CREDENTIALS_ERROR = 'වැරදි Username හෝ Password / Invalid username or password';

export async function loginAction(formData: FormData): Promise<AuthResult> {
  const username = String(formData.get('username') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');
  const keepLoggedIn = formData.get('keepLoggedIn') === 'on';

  if (!username || !password) {
    return { error: 'Username සහ Password දෙකම ඕන / Username and password are required' };
  }

  const admin = createAdminClient();
  const { data: profile } = await admin.from('profiles').select('id').eq('username', username).maybeSingle();
  if (!profile) {
    return { error: INVALID_CREDENTIALS_ERROR };
  }

  const { data: userData, error: userError } = await admin.auth.admin.getUserById(profile.id);
  if (userError || !userData.user?.email) {
    return { error: INVALID_CREDENTIALS_ERROR };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email: userData.user.email, password });

  if (error) {
    return { error: INVALID_CREDENTIALS_ERROR };
  }

  // Logging doesn't need to block the redirect — after() lets it finish
  // in the background instead of adding a 4th sequential round-trip.
  after(() => logActivity(profile.id, 'login', `@${username} logged in`));

  // "Keep me logged in" -> extend session lifetime via a long-lived cookie flag.
  // Supabase's default session already persists via cookies; when unchecked we
  // mark the session so the client can decide to sign out on browser close.
  if (!keepLoggedIn) {
    const cookieStore = (await import('next/headers')).cookies;
    (await cookieStore()).set('mdms-session-persist', 'false', { path: '/' });
  }

  redirect('/dashboard');
}

export async function logoutAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    after(() => logActivity(user.id, 'logout', `${user.email ?? 'User'} logged out`));
  }

  await supabase.auth.signOut();
  redirect('/login');
}

export async function requestPasswordResetAction(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get('email') || '').trim();

  if (!email) {
    return { error: 'Email එක ඕන / Email is required' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/reset-password`,
  });

  if (error) {
    return { error: 'Reset link එක යවන්න බැරි වුණා. නැවත උත්සාහ කරන්න.' };
  }

  return {};
}
