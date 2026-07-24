'use client';

import { useRef, useState } from 'react';
import { Camera, Loader2, Building2 } from 'lucide-react';
import { compressAndUploadFinancePhoto } from '@/lib/uploadFinancePhoto';
import { getFinancePhotoPublicUrl } from '@/lib/storageUrls';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function CompanyLogoPicker({ defaultPhotoPath }: { defaultPhotoPath?: string | null }) {
  const { t } = useLanguage();
  const [photoPath, setPhotoPath] = useState(defaultPhotoPath ?? '');
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    defaultPhotoPath ? getFinancePhotoPublicUrl(defaultPhotoPath) : null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(undefined);
    setIsUploading(true);
    try {
      const path = await compressAndUploadFinancePhoto(file, 'companies');
      setPhotoPath(path);
      setPreviewUrl(URL.createObjectURL(file));
    } catch {
      setError(t('document_upload_failed'));
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 text-slate-400 transition hover:border-brand-dark hover:text-brand disabled:opacity-50 dark:border-slate-700"
        >
          {isUploading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="" className="h-full w-full object-contain" />
          ) : (
            <Building2 size={22} />
          )}
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline disabled:opacity-50"
        >
          <Camera size={14} /> {previewUrl ? t('change_photo') : t('company_logo_label')}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <input type="hidden" name="logoPath" value={photoPath} />
    </div>
  );
}
