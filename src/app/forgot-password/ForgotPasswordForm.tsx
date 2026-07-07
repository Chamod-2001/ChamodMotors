'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { requestPasswordResetAction } from '../login/actions';

export function ForgotPasswordForm() {
  const { t } = useLanguage();
  const [error, setError] = useState<string | undefined>();
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError(undefined);
    startTransition(async () => {
      const result = await requestPasswordResetAction(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setSent(true);
      }
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-slate-900">
          {t('reset_password')}
        </h1>

        {sent ? (
          <div className="space-y-4 text-center">
            <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
              Reset link එක ඔබේ email එකට යැව්වා. Inbox එක check කරන්න.
            </p>
            <Link href="/login">
              <Button variant="secondary" fullWidth>{t('back_to_login')}</Button>
            </Link>
          </div>
        ) : (
          <form action={handleSubmit} className="space-y-4">
            <Input
              id="email"
              name="email"
              type="email"
              label={t('email')}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />

            {error && (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
            )}

            <Button type="submit" fullWidth disabled={isPending}>
              {isPending ? t('loading') : t('send_reset_link')}
            </Button>

            <Link href="/login" className="block text-center text-sm font-medium text-brand hover:underline">
              {t('back_to_login')}
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
