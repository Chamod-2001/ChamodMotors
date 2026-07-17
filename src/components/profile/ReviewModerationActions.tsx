'use client';

import { useTransition } from 'react';
import { Check, Trash2 } from 'lucide-react';
import { approveShopReviewAction, deleteShopReviewAction } from '@/app/reviews/actions';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function ReviewModerationActions({
  reviewId,
  photoPath,
  showApprove,
}: {
  reviewId: string;
  photoPath: string | null;
  showApprove: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const { t } = useLanguage();

  function handleApprove() {
    startTransition(() => {
      approveShopReviewAction(reviewId);
    });
  }

  function handleDelete() {
    if (!confirm(t('review_delete_confirm'))) return;
    startTransition(() => {
      deleteShopReviewAction(reviewId, photoPath);
    });
  }

  return (
    <div className="flex gap-2">
      {showApprove && (
        <button
          type="button"
          onClick={handleApprove}
          disabled={isPending}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
        >
          <Check size={16} /> {t('approve')}
        </button>
      )}
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border-2 border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        <Trash2 size={16} /> {t('delete')}
      </button>
    </div>
  );
}
