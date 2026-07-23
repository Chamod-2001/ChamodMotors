'use client';

import imageCompression from 'browser-image-compression';
import { createClient } from '@/lib/supabase/client';

/**
 * Compresses an image in the browser and uploads it to the public
 * `customer-photos` bucket. Returns the storage path to save against
 * the customer record.
 */
export async function compressAndUploadCustomerPhoto(file: File): Promise<string> {
  const compressed = await imageCompression(file, {
    maxSizeMB: 0.4,
    maxWidthOrHeight: 800,
    useWebWorker: true,
    fileType: 'image/jpeg',
  });

  const supabase = createClient();
  const fileName = `${crypto.randomUUID()}.jpg`;
  const path = `customers/${fileName}`;

  const { error } = await supabase.storage.from('customer-photos').upload(path, compressed, {
    contentType: 'image/jpeg',
    upsert: false,
  });

  if (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }

  return path;
}
