'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/queries/session';
import { logActivity } from '@/lib/activity';

export interface ReviewActionResult {
  error?: string;
}

// No login required — this is a public review submission from /p or /profile.
// The row always starts "pending"; it only becomes publicly visible once an
// admin approves it (see approveShopReviewAction).
export async function submitShopReviewAction(formData: FormData): Promise<ReviewActionResult> {
  const reviewerName = String(formData.get('reviewer_name') || '').trim();
  const rating = Number(formData.get('rating') || 0);
  const description = String(formData.get('description') || '').trim();
  const photoPath = String(formData.get('photo_path') || '').trim();

  if (!reviewerName) return { error: 'නම දෙන්න / Please enter your name' };
  if (!rating || rating < 1 || rating > 5) return { error: 'Star rating එකක් තෝරන්න / Please pick a star rating' };
  if (!description) return { error: 'ඔබේ අත්දැකීම ලියන්න / Please write about your experience' };

  const supabase = await createClient();

  const { error } = await supabase.from('shop_reviews').insert({
    reviewer_name: reviewerName,
    rating,
    description,
    photo_path: photoPath || null,
    status: 'pending',
  });

  if (error) {
    return { error: 'Review save කරන්න බැරි වුණා. නැවත උත්සාහ කරන්න.' };
  }

  await logActivity(null, 'shop_review_submitted', `${reviewerName} (${rating}★)`);

  revalidatePath('/p');
  revalidatePath('/profile');
  return {};
}

export async function approveShopReviewAction(reviewId: string): Promise<ReviewActionResult> {
  const admin = await requireAdmin();
  const supabase = await createClient();

  const { data: review, error } = await supabase
    .from('shop_reviews')
    .update({ status: 'approved', reviewed_by: admin.id, reviewed_at: new Date().toISOString() })
    .eq('id', reviewId)
    .select('reviewer_name')
    .single();

  if (error) {
    return { error: 'Review approve කරන්න බැරි වුණා. නැවත උත්සාහ කරන්න.' };
  }

  await logActivity(admin.id, 'shop_review_approved', review?.reviewer_name ?? '');

  revalidatePath('/p');
  revalidatePath('/profile');
  return {};
}

export async function deleteShopReviewAction(reviewId: string, photoPath: string | null): Promise<ReviewActionResult> {
  const admin = await requireAdmin();
  const supabase = await createClient();

  if (photoPath) {
    await supabase.storage.from('review-photos').remove([photoPath]);
  }

  const { error } = await supabase.from('shop_reviews').delete().eq('id', reviewId);
  if (error) {
    return { error: 'Review delete කරන්න බැරි වුණා. නැවත උත්සාහ කරන්න.' };
  }

  await logActivity(admin.id, 'shop_review_deleted', '');

  revalidatePath('/p');
  revalidatePath('/profile');
  return {};
}
