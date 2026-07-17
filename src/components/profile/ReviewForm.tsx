'use client';

import { useRef, useState, useTransition } from 'react';
import { Star, Camera, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { submitShopReviewAction } from '@/app/reviews/actions';
import { compressAndUploadReviewPhoto } from '@/lib/uploadReviewPhoto';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function ReviewForm() {
  const { t } = useLanguage();
  const [rating, setRating] = useState(0);
  const [photoPath, setPhotoPath] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handlePhotoPicked(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    setError(undefined);
    setIsUploadingPhoto(true);
    try {
      const path = await compressAndUploadReviewPhoto(file);
      setPhotoPath(path);
      setPhotoPreview(URL.createObjectURL(file));
    } catch {
      setError(t('review_photo_upload_failed'));
    } finally {
      setIsUploadingPhoto(false);
    }
  }

  function removePhoto() {
    setPhotoPath(null);
    setPhotoPreview(null);
  }

  async function handleSubmit(formData: FormData) {
    setError(undefined);
    if (rating === 0) {
      setError(t('review_rating_required'));
      return;
    }
    formData.set('rating', String(rating));
    if (photoPath) formData.set('photo_path', photoPath);

    startTransition(async () => {
      const result = await submitShopReviewAction(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setSubmitted(true);
        formRef.current?.reset();
        setRating(0);
        removePhoto();
      }
    });
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-center text-sm text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-400">
        {t('review_submitted_thanks')}
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
    >
      <p className="font-semibold text-slate-900 dark:text-slate-100">{t('write_a_review')}</p>

      <div className="flex justify-center gap-1 py-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button key={value} type="button" onClick={() => setRating(value)} aria-label={`${value} star`} className="p-1">
            <Star size={28} className={value <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'} />
          </button>
        ))}
      </div>

      <Input name="reviewer_name" placeholder={t('your_name_placeholder')} required className="!py-3 !text-base !min-h-0" />

      <textarea
        name="description"
        rows={3}
        required
        placeholder={t('review_experience_placeholder')}
        className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-base focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-light dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      />

      {photoPreview ? (
        <div className="relative h-24 w-24">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photoPreview} alt="" className="h-full w-full rounded-xl object-cover" />
          <button
            type="button"
            onClick={removePhoto}
            className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
            aria-label={t('remove_photo')}
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={isUploadingPhoto}
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 px-4 py-3 text-sm font-medium text-slate-500 hover:border-brand-dark hover:text-brand disabled:opacity-50 dark:border-slate-700"
        >
          {isUploadingPhoto ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
          {t('add_photo_optional')}
        </button>
      )}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoPicked(e.target.files)} />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" fullWidth disabled={isPending || isUploadingPhoto} className="!min-h-[48px]">
        {isPending ? t('saving') : t('submit_review')}
      </Button>
    </form>
  );
}
