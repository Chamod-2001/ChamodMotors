'use client';

import imageCompression from 'browser-image-compression';
import { createClient } from '@/lib/supabase/client';

/**
 * Compresses an image in the browser (to save storage/bandwidth, per spec)
 * and uploads it to the public `vehicle-images` bucket.
 * Returns the storage path to save against the vehicle record.
 */
export async function compressAndUploadVehicleImage(file: File): Promise<string> {
  const compressed = await imageCompression(file, {
    maxSizeMB: 0.6,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    fileType: 'image/jpeg',
  });

  const supabase = createClient();
  const fileName = `${crypto.randomUUID()}.jpg`;
  const path = `vehicles/${fileName}`;

  const { error } = await supabase.storage.from('vehicle-images').upload(path, compressed, {
    contentType: 'image/jpeg',
    upsert: false,
  });

  if (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }

  return path;
}
