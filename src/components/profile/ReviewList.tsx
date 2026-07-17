import { Star } from 'lucide-react';
import { getTranslator } from '@/lib/i18n/server';
import { getReviewImagePublicUrl } from '@/lib/storageUrls';
import type { ShopReviewItem } from '@/lib/queries/shopReviews';

export async function ReviewList({ reviews }: { reviews: ShopReviewItem[] }) {
  if (reviews.length === 0) return null;
  const t = await getTranslator();

  return (
    <div>
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">{t('reviews_label')}</h2>
      <div className="space-y-2">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-light text-sm font-bold text-brand-dark">
                {review.reviewerName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-slate-900 dark:text-slate-100">{review.reviewerName}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <Star
                        key={value}
                        size={14}
                        className={value <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(review.createdAt).toLocaleDateString('en-LK', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{review.description}</p>
            {review.photoPath && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={getReviewImagePublicUrl(review.photoPath)}
                alt=""
                className="mt-3 h-40 w-full rounded-xl object-cover"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
