'use client';

import { useRef, useState } from 'react';
import { Camera, Loader2, User } from 'lucide-react';
import { compressAndUploadCustomerPhoto } from '@/lib/uploadCustomerPhoto';
import { getCustomerPhotoPublicUrl } from '@/lib/storageUrls';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function CustomerPhotoPicker({ defaultPhotoPath }: { defaultPhotoPath?: string | null }) {
  const { t } = useLanguage();
  const [photoPath, setPhotoPath] = useState(defaultPhotoPath ?? '');
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    defaultPhotoPath ? getCustomerPhotoPublicUrl(defaultPhotoPath) : null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(undefined);
    setIsUploading(true);
    try {
      const path = await compressAndUploadCustomerPhoto(file);
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
      <label className="mb-2 block text-base font-medium text-slate-700 dark:text-slate-300">
        {t('customer_photo_label')}
      </label>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-slate-300 text-slate-400 transition hover:border-brand-dark hover:text-brand disabled:opacity-50 dark:border-slate-700"
        >
          {isUploading ? (
            <Loader2 size={22} className="animate-spin" />
          ) : previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <User size={28} />
          )}
        </button>

        <div className="flex flex-col items-start gap-1">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline disabled:opacity-50"
          >
            <Camera size={14} /> {previewUrl ? t('change_photo') : t('add_photo_optional')}
          </button>
          {previewUrl && (
            <button
              type="button"
              onClick={() => {
                setPhotoPath('');
                setPreviewUrl(null);
              }}
              className="text-sm text-red-500 hover:underline"
            >
              {t('remove_photo')}
            </button>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <input type="hidden" name="photoPath" value={photoPath} />
    </div>
  );
}
