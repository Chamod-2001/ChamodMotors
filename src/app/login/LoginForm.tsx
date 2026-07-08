'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { loginAction } from './actions';
import logo from '@/assets/ChamodMotors.png';

export function LoginForm() {
  const { t } = useLanguage();
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError(undefined);
    startTransition(async () => {
      const result = await loginAction(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-end gap-2">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-md dark:bg-slate-900">
          <Image src={logo} alt="Chamod Motors" className="mx-auto mb-2 h-20 w-20 object-contain" priority />
          <h1 className="mb-1 text-center text-2xl font-bold text-slate-900 dark:text-slate-100">
            Chamod Motors
          </h1>
          <p className="mb-6 text-center text-sm text-slate-500 dark:text-slate-400">
            {t('tagline')}
          </p>

          <form action={handleSubmit} className="mt-6 space-y-4">
            <Input
              id="username"
              name="username"
              type="text"
              label={t('username')}
              placeholder="e.g. nimal"
              required
              autoComplete="username"
            />
            <Input
              id="password"
              name="password"
              type="password"
              label={t('password')}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" name="keepLoggedIn" defaultChecked className="h-5 w-5 rounded" />
                {t('keep_logged_in')}
              </label>
              <Link href="/forgot-password" className="text-sm font-medium text-brand hover:underline">
                {t('forgot_password')}
              </Link>
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
            )}

            <Button type="submit" fullWidth disabled={isPending}>
              {isPending ? t('loading') : t('login')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
