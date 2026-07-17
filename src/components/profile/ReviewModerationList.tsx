import { Star } from 'lucide-react';
import { getReviewImagePublicUrl } from '@/lib/storageUrls';
import { ReviewModerationActions } from './ReviewModerationActions';
import type { ShopReviewItem } from '@/lib/queries/shopReviews';

export function ReviewModerationList({
  reviews,
  showApprove,
  emptyMessage,
}: {
  reviews: ShopReviewItem[];
  showApprove: boolean;
  emptyMessage: string;
}) {
  if (reviews.length === 0) {
    return <p className="py-6 text-center text-sm text-slate-400">{emptyMessage}</p>;
  }

  return (
    <ul className="space-y-3">
      {reviews.map((review) => (
        <li key={review.id} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-slate-800 dark:text-slate-100">{review.reviewerName}</p>
            <div className="flex shrink-0">
              {[1, 2, 3, 4, 5].map((value) => (
                <Star
                  key={value}
                  size={14}
                  className={value <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}
                />
              ))}
            </div>
          </div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{review.description}</p>
          {review.photoPath && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={getReviewImagePublicUrl(review.photoPath)} alt="" className="mt-2 h-24 w-24 rounded-xl object-cover" />
          )}
          <div className="mt-3">
            <ReviewModerationActions reviewId={review.id} photoPath={review.photoPath} showApprove={showApprove} />
          </div>
        </li>
      ))}
    </ul>
  );
}
