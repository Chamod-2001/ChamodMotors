'use client';

import { useRef, useState, useTransition } from 'react';
import { User, Camera, Loader2 } from 'lucide-react';
import { compressAndUploadEmployeePhoto } from '@/lib/uploadEmployeePhoto';
import { getEmployeePhotoPublicUrl } from '@/lib/storageUrls';
import { updateEmployeePhotoAction } from '@/app/employees/actions';
import { useLanguage } from '@/lib/i18n/LanguageContext';

/** Tap the avatar to change it — uploads and saves immediately, no separate
 * edit-employee page needed. Admin-only (this whole page requires admin). */
export function EmployeeAvatarPicker({ employeeId, photoPath }: { employeeId: string; photoPath: string | null }) {
  const { t } = useLanguage();
  const [previewUrl, setPreviewUrl] = useState<string | null>(photoPath ? getEmployeePhotoPublicUrl(photoPath) : null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(undefined);
    setIsUploading(true);
    try {
      const path = await compressAndUploadEmployeePhoto(file);
      setPreviewUrl(URL.createObjectURL(file));
      startTransition(async () => {
        const result = await updateEmployeePhotoAction(employeeId, path);
        if (result?.error) setError(result.error);
      });
    } catch {
      setError(t('document_upload_failed'));
    } finally {
      setIsUploading(false);
    }
  }

  const busy = isUploading || isPending;

  return (
    <div className="shrink-0">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={busy}
        aria-label={t('change_photo')}
        className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-brand-light text-brand disabled:opacity-50"
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <User size={20} />
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 transition hover:opacity-100">
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
        </span>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {error && <p className="mt-1 max-w-[6rem] text-[10px] text-red-600">{error}</p>}
    </div>
  );
}
