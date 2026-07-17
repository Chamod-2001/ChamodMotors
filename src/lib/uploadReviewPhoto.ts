'use client';

import imageCompression from 'browser-image-compression';
import { createClient } from '@/lib/supabase/client';

/**
 * Compresses a customer-submitted review photo and uploads it to the public
 * `review-photos` bucket. No login required — the bucket's insert policy is
 * intentionally open, since reviews can be submitted by anonymous visitors.
 */
export async function compressAndUploadReviewPhoto(file: File): Promise<string> {
  const compressed = await imageCompression(file, {
    maxSizeMB: 0.6,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    fileType: 'image/jpeg',
  });

  const supabase = createClient();
  const fileName = `${crypto.randomUUID()}.jpg`;

  const { error } = await supabase.storage.from('review-photos').upload(fileName, compressed, {
    contentType: 'image/jpeg',
    upsert: false,
  });

  if (error) {
    throw new Error(`Review photo upload failed: ${error.message}`);
  }

  return fileName;
}
