import { createClient } from '@/lib/supabase/server';
import type { ReviewStatus } from '../../../types/database.types';

export interface ShopReviewItem {
  id: string;
  reviewerName: string;
  rating: number;
  description: string;
  photoPath: string | null;
  status: ReviewStatus;
  createdAt: string;
}

type Row = {
  id: string;
  reviewer_name: string;
  rating: number;
  description: string;
  photo_path: string | null;
  status: ReviewStatus;
  created_at: string;
};

function mapRow(row: Row): ShopReviewItem {
  return {
    id: row.id,
    reviewerName: row.reviewer_name,
    rating: row.rating,
    description: row.description,
    photoPath: row.photo_path,
    status: row.status,
    createdAt: row.created_at,
  };
}

const SELECT = 'id, reviewer_name, rating, description, photo_path, status, created_at';

/** Approved reviews only — public display on /profile and /p. */
export async function listApprovedShopReviews(): Promise<ShopReviewItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('shop_reviews')
    .select(SELECT)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  return ((data ?? []) as Row[]).map(mapRow);
}

/** Pending reviews awaiting admin moderation. */
export async function listPendingShopReviews(): Promise<ShopReviewItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('shop_reviews')
    .select(SELECT)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  return ((data ?? []) as Row[]).map(mapRow);
}
