import { requireAdmin } from '@/lib/queries/session';
import { getTranslator } from '@/lib/i18n/server';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { BackupButton } from '@/components/backup/BackupButton';

export default async function BackupPage() {
  await requireAdmin();
  const t = await getTranslator();

  return (
    <AppShell title={t('backup_label')}>
      <div className="mx-auto max-w-2xl space-y-4 p-4">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t('backup_label')}</h1>
        <Card>
          <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">{t('backup_description')}</p>
          <BackupButton />
        </Card>
      </div>
    </AppShell>
  );
}
