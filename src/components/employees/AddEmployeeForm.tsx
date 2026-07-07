'use client';

import { useState, useTransition } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { createEmployeeAction } from '@/app/employees/actions';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function AddEmployeeForm() {
  const { t } = useLanguage();
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError(undefined);
    startTransition(async () => {
      const result = await createEmployeeAction(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <Input name="full_name" label={t('full_name')} required placeholder="e.g. Nimal Perera" />
      <Input
        name="username"
        label={t('username')}
        required
        placeholder="e.g. nimal"
        pattern="[a-z0-9_.]+"
        title={t('username_pattern_hint')}
      />
      <Input
        name="email"
        label={t('email')}
        type="email"
        required
        placeholder="employee@example.com"
      />
      <Input name="password" label={t('password')} type="password" required placeholder={t('min_6_chars')} />
      <Select name="role" label={t('role_label')} defaultValue="sales">
        <option value="sales">{t('sales_employee')}</option>
        <option value="admin">{t('admin_role')}</option>
      </Select>

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <Button type="submit" fullWidth disabled={isPending}>
        {isPending ? t('creating') : t('add_employee')}
      </Button>
    </form>
  );
}
