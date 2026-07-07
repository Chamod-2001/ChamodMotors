'use client';

import imageCompression from 'browser-image-compression';
import { createClient } from '@/lib/supabase/client';

/**
 * Compresses an image in the browser and uploads it to the public
 * `shop-photos` bucket. Returns the storage path to save.
 */
export async function compressAndUploadShopImage(file: File, folder: 'cover' | 'gallery'): Promise<string> {
  // The cover photo is shown large and full-width, so give it a bigger size/
  // quality budget than gallery thumbnails to avoid a blurry banner.
  const compressed = await imageCompression(file, {
    maxSizeMB: folder === 'cover' ? 1.5 : 0.6,
    maxWidthOrHeight: folder === 'cover' ? 2400 : 1600,
    useWebWorker: true,
    fileType: 'image/jpeg',
  });

  const supabase = createClient();
  const fileName = `${crypto.randomUUID()}.jpg`;
  const path = `${folder}/${fileName}`;

  const { error } = await supabase.storage.from('shop-photos').upload(path, compressed, {
    contentType: 'image/jpeg',
    upsert: false,
  });

  if (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }

  return path;
}
