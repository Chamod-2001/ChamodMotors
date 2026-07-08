'use client';

import { createClient } from '@/lib/supabase/client';

/**
 * Uploads a file as-is (no compression — these are often PDFs/scans, not
 * photos) to the private `documents` bucket. Returns the storage path to
 * save against the `documents` table row.
 */
export async function uploadDocumentFile(file: File): Promise<string> {
  const supabase = createClient();
  const ext = file.name.includes('.') ? file.name.split('.').pop() : 'bin';
  const path = `docs/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from('documents').upload(path, file, {
    contentType: file.type || undefined,
    upsert: false,
  });

  if (error) {
    throw new Error(`Document upload failed: ${error.message}`);
  }

  return path;
}
