'use client';

import imageCompression from 'browser-image-compression';
import { createClient } from '@/lib/supabase/client';

/** Compresses an image and uploads it to the public `employee-photos` bucket. */
export async function compressAndUploadEmployeePhoto(file: File): Promise<string> {
  const compressed = await imageCompression(file, {
    maxSizeMB: 0.4,
    maxWidthOrHeight: 800,
    useWebWorker: true,
    fileType: 'image/jpeg',
  });

  const supabase = createClient();
  const fileName = `${crypto.randomUUID()}.jpg`;
  const path = `staff/${fileName}`;

  const { error } = await supabase.storage.from('employee-photos').upload(path, compressed, {
    contentType: 'image/jpeg',
    upsert: false,
  });

  if (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }

  return path;
}
