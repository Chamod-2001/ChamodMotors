'use client';

import { useRef, useState, useTransition } from 'react';
import { Camera, ImagePlus, X, Loader2 } from 'lucide-react';
import { compressAndUploadShopImage } from '@/lib/uploadShopImage';
import { getShopImagePublicUrl } from '@/lib/storageUrls';
import { setShopCoverPhotoAction, addShopPhotoAction, deleteShopPhotoAction } from '@/app/profile/actions';
import { CoverPhotoCropper } from './CoverPhotoCropper';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { ShopPhoto } from '../../../types/database.types';

export function ShopPhotoManager({
  coverPhotoPath,
  photos,
}: {
  coverPhotoPath: string | null;
  photos: ShopPhoto[];
}) {
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [pendingCoverFile, setPendingCoverFile] = useState<File | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [, startTransition] = useTransition();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  function handleCoverPicked(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    setError(undefined);
    setPendingCoverFile(file);
  }

  async function handleCoverCropped(blob: Blob) {
    setPendingCoverFile(null);
    setIsUploadingCover(true);
    try {
      const file = new File([blob], 'cover.jpg', { type: 'image/jpeg' });
      const path = await compressAndUploadShopImage(file, 'cover');
      startTransition(async () => {
        await setShopCoverPhotoAction(path);
      });
    } catch {
      setError('Cover photo upload එක fail වුණා. නැවත උත්සාහ කරන්න.');
    } finally {
      setIsUploadingCover(false);
    }
  }

  async function handleGalleryChange(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError(undefined);
    setIsUploadingGallery(true);
    try {
      for (const file of Array.from(fileList)) {
        const path = await compressAndUploadShopImage(file, 'gallery');
        await addShopPhotoAction(path);
      }
    } catch {
      setError('Photo upload එක fail වුණා. නැවත උත්සාහ කරන්න.');
    } finally {
      setIsUploadingGallery(false);
    }
  }

  function handleDelete(photo: ShopPhoto) {
    startTransition(async () => {
      await deleteShopPhotoAction(photo.id, photo.storage_path);
    });
  }

  return (
    <div className="space-y-4">
      {pendingCoverFile && (
        <CoverPhotoCropper
          file={pendingCoverFile}
          onCancel={() => setPendingCoverFile(null)}
          onCropped={handleCoverCropped}
        />
      )}

      <div>
        <label className="mb-2 block text-base font-medium text-slate-700 dark:text-slate-300">{t('cover_photo')}</label>
        <button
          type="button"
          disabled={isUploadingCover}
          onClick={() => coverInputRef.current?.click()}
          className="relative flex h-32 w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-brand-dark hover:text-brand disabled:opacity-50 dark:border-slate-700"
        >
          {coverPhotoPath ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={getShopImagePublicUrl(coverPhotoPath)} alt="" className="h-full w-full object-cover" />
          ) : isUploadingCover ? (
            <Loader2 size={24} className="animate-spin" />
          ) : (
            <span className="flex flex-col items-center gap-1 text-sm font-medium">
              <Camera size={22} /> {t('upload_cover_photo')}
            </span>
          )}
          {coverPhotoPath && isUploadingCover && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Loader2 size={24} className="animate-spin text-white" />
            </div>
          )}
        </button>
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            handleCoverPicked(e.target.files);
            e.target.value = '';
          }}
        />
        <p className="mt-1 text-xs text-slate-400">{t('crop_hint')}</p>
      </div>

      <div>
        <label className="mb-2 block text-base font-medium text-slate-700 dark:text-slate-300">{t('gallery_photos')}</label>
        <div className="flex flex-wrap gap-3">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative h-24 w-24 overflow-hidden rounded-xl border-2 border-slate-200 dark:border-slate-700">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={getShopImagePublicUrl(photo.storage_path)} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => handleDelete(photo)}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
                aria-label={t('remove_photo')}
              >
                <X size={14} />
              </button>
            </div>
          ))}

          <button
            type="button"
            disabled={isUploadingGallery}
            onClick={() => galleryInputRef.current?.click()}
            className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-brand-dark hover:text-brand disabled:opacity-50 dark:border-slate-700"
          >
            {isUploadingGallery ? <Loader2 size={22} className="animate-spin" /> : <ImagePlus size={22} />}
            <span className="text-xs font-medium">{t('add')}</span>
          </button>
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleGalleryChange(e.target.files)}
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
