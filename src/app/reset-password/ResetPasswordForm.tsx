'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { updatePasswordAction } from './actions';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function ResetPasswordForm() {
  const { t } = useLanguage();
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError(undefined);
    startTransition(async () => {
      const result = await updatePasswordAction(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-slate-900">
          {t('set_new_password_title')}
        </h1>

        <form action={handleSubmit} className="space-y-4">
          <Input
            id="password"
            name="password"
            type="password"
            label={t('new_password')}
            placeholder="••••••••"
            required
            minLength={8}
            autoComplete="new-password"
          />
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label={t('confirm_password')}
            placeholder="••••••••"
            required
            minLength={8}
            autoComplete="new-password"
          />

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          )}

          <Button type="submit" fullWidth disabled={isPending}>
            {isPending ? t('saving') : t('save_new_password')}
          </Button>
        </form>
      </div>
    </div>
  );
}
