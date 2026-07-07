'use client';

import { useRef, useState } from 'react';
import { Camera, ImagePlus, X, Loader2, Star } from 'lucide-react';
import { compressAndUploadVehicleImage } from '@/lib/uploadVehicleImage';
import { getVehicleImagePublicUrl } from '@/lib/storageUrls';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export interface PickedImage {
  path: string;
  previewUrl: string;
}

interface VehicleImagePickerProps {
  existingImages?: { id: string; storage_path: string }[];
  onRemoveExisting?: (imageId: string, storagePath: string) => void;
  images: PickedImage[];
  onChange: (images: PickedImage[]) => void;
}

export function VehicleImagePicker({
  existingImages = [],
  onRemoveExisting,
  images,
  onChange,
}: VehicleImagePickerProps) {
  const { t } = useLanguage();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError(undefined);
    setIsUploading(true);
    try {
      const files = Array.from(fileList);
      const uploaded: PickedImage[] = [];
      for (const file of files) {
        const path = await compressAndUploadVehicleImage(file);
        uploaded.push({ path, previewUrl: URL.createObjectURL(file) });
      }
      onChange([...images, ...uploaded]);
    } catch {
      setError('Photo upload එක fail වුණා. නැවත උත්සාහ කරන්න.');
    } finally {
      setIsUploading(false);
    }
  }

  function removeNew(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  return (
    <div>
      <label className="mb-2 block text-base font-medium text-slate-700">{t('vehicle_photos')}</label>

      <div className="flex flex-wrap gap-3">
        {/* Existing (already uploaded) images */}
        {existingImages.map((img) => (
          <div key={img.id} className="group relative h-24 w-24 overflow-hidden rounded-xl border-2 border-slate-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={getVehicleImagePublicUrl(img.storage_path)} alt="" className="h-full w-full object-cover" />
            {onRemoveExisting && (
              <button
                type="button"
                onClick={() => onRemoveExisting(img.id, img.storage_path)}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
                aria-label={t('remove_photo')}
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}

        {/* Newly picked (this session) images */}
        {images.map((img, index) => (
          <div key={img.path} className="group relative h-24 w-24 overflow-hidden rounded-xl border-2 border-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.previewUrl} alt="" className="h-full w-full object-cover" />
            {index === 0 && existingImages.length === 0 && (
              <span className="absolute left-1 top-1 flex items-center gap-0.5 rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-semibold text-white">
                <Star size={10} /> {t('main_photo_badge')}
              </span>
            )}
            <button
              type="button"
              onClick={() => removeNew(index)}
              className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
              aria-label={t('remove_photo')}
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {/* Camera capture */}
        <button
          type="button"
          disabled={isUploading}
          onClick={() => cameraInputRef.current?.click()}
          className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-brand-dark hover:text-brand disabled:opacity-50"
        >
          {isUploading ? <Loader2 size={22} className="animate-spin" /> : <Camera size={22} />}
          <span className="text-xs font-medium">{t('camera')}</span>
        </button>
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {/* Gallery / file picker */}
        <button
          type="button"
          disabled={isUploading}
          onClick={() => galleryInputRef.current?.click()}
          className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-brand-dark hover:text-brand disabled:opacity-50"
        >
          {isUploading ? <Loader2 size={22} className="animate-spin" /> : <ImagePlus size={22} />}
          <span className="text-xs font-medium">{t('gallery')}</span>
        </button>
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <p className="mt-2 text-xs text-slate-400">{t('photos_compressed_hint')}</p>
    </div>
  );
}
