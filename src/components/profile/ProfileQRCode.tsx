'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Download } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function ProfileQRCode() {
  const [state, setState] = useState<{ dataUrl: string; url: string } | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const shareUrl = `${window.location.origin}/p?src=qr`;
    QRCode.toDataURL(shareUrl, { width: 320, margin: 1, color: { dark: '#0f172a', light: '#ffffff' } })
      .then((dataUrl) => setState({ dataUrl, url: shareUrl }))
      .catch(() => {});
  }, []);

  function handleDownload() {
    if (!state) return;
    const a = document.createElement('a');
    a.href = state.dataUrl;
    a.download = 'chamod-motors-qr.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  if (!state) return null;

  return (
    <Card className="flex flex-col items-center gap-3 text-center">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{t('scan_to_share')}</h2>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={state.dataUrl} alt="QR code linking to the public shop profile" className="h-40 w-40 rounded-lg" />
      <p className="max-w-xs truncate text-xs text-slate-400">{state.url}</p>
      <button
        type="button"
        onClick={handleDownload}
        className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <Download size={14} /> {t('download_qr')}
      </button>
    </Card>
  );
}
