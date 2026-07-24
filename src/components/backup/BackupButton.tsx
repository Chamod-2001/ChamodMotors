'use client';

import { useState } from 'react';
import { Download, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getBackupManifestAction } from '@/app/backup/actions';
import { useLanguage } from '@/lib/i18n/LanguageContext';

type Status = 'idle' | 'fetching' | 'zipping' | 'done' | 'error';

export function BackupButton() {
  const { t } = useLanguage();
  const [status, setStatus] = useState<Status>('idle');
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState<string | undefined>();

  async function handleBackup() {
    setError(undefined);
    setStatus('fetching');
    setProgress({ done: 0, total: 0 });

    try {
      const manifest = await getBackupManifestAction();
      if ('error' in manifest) {
        setError(manifest.error);
        setStatus('error');
        return;
      }

      setStatus('zipping');
      const { default: JSZip } = await import('jszip');
      const zip = new JSZip();

      for (const [table, rows] of Object.entries(manifest.tables)) {
        zip.file(`data/${table}.json`, JSON.stringify(rows, null, 2));
      }

      setProgress({ done: 0, total: manifest.files.length });
      let done = 0;
      for (const file of manifest.files) {
        try {
          const res = await fetch(file.url);
          if (res.ok) {
            zip.file(`files/${file.bucket}/${file.path}`, await res.blob());
          }
        } catch {
          // one bad file shouldn't sink the whole backup — skip and continue
        }
        done += 1;
        setProgress({ done, total: manifest.files.length });
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chamod-motors-backup-${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatus('done');
    } catch {
      setError(t('backup_failed'));
      setStatus('error');
    }
  }

  const busy = status === 'fetching' || status === 'zipping';

  return (
    <div>
      <Button onClick={handleBackup} disabled={busy} fullWidth>
        {busy ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
        {status === 'fetching' && t('backup_preparing')}
        {status === 'zipping' &&
          (progress.total > 0 ? `${t('backup_downloading_files')} (${progress.done}/${progress.total})` : t('backup_zipping'))}
        {(status === 'idle' || status === 'done' || status === 'error') && t('download_backup')}
      </Button>
      {status === 'done' && (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-green-600">
          <CheckCircle2 size={14} /> {t('backup_done')}
        </p>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
