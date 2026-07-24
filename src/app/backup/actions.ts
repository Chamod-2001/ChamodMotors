'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/queries/session';

// Every table with real business data — a plain `select *` dump of each,
// no file bytes (those are handled separately via the storage bucket list
// below, fetched directly by the browser so the server never holds them).
const BUSINESS_TABLES = [
  'profiles',
  'vehicles',
  'vehicle_images',
  'vehicle_expenses',
  'vehicle_catalog',
  'customers',
  'sales',
  'finance_companies',
  'finance_officers',
  'finance_communications',
  'documents',
  'activity_log',
  'shop_profile',
  'shop_photos',
  'shop_social_links',
  'shop_locations',
  'shop_profile_views',
  'reminders',
  'vehicle_edit_requests',
  'shop_reviews',
] as const;

const PUBLIC_BUCKETS = ['vehicle-images', 'customer-photos', 'finance-photos', 'employee-photos', 'shop-photos', 'review-photos'];
const PRIVATE_BUCKETS = ['documents'];

export interface BackupFileEntry {
  bucket: string;
  path: string;
  url: string;
}

export interface BackupManifest {
  generatedAt: string;
  tables: Record<string, unknown[]>;
  files: BackupFileEntry[];
}

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

/** Recursively lists every file in a bucket — folder depth isn't fixed
 * across buckets (vehicles/, customers/, companies/, officers/, staff/,
 * docs/, ...), so this walks whatever structure is actually there instead
 * of hardcoding each bucket's convention. */
async function listAllFiles(supabase: SupabaseServerClient, bucket: string, prefix = ''): Promise<string[]> {
  const { data } = await supabase.storage.from(bucket).list(prefix, { limit: 1000 });
  if (!data) return [];

  const paths: string[] = [];
  for (const entry of data) {
    const fullPath = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.id) {
      paths.push(fullPath);
    } else {
      paths.push(...(await listAllFiles(supabase, bucket, fullPath)));
    }
  }
  return paths;
}

/** Builds a full backup manifest — every table's rows as JSON, plus a
 * downloadable URL for every file in every storage bucket. The browser does
 * the actual file downloading + zipping (see BackupButton) so this action
 * only ever handles metadata, keeping it fast and well within any
 * serverless function time limit regardless of how many photos exist. */
export async function getBackupManifestAction(): Promise<BackupManifest | { error: string }> {
  await requireAdmin();
  const supabase = await createClient();

  const tableResults = await Promise.all(
    BUSINESS_TABLES.map(async (table) => {
      const { data, error } = await supabase.from(table).select('*');
      return [table, error ? [] : (data ?? [])] as [string, unknown[]];
    })
  );
  const tables = Object.fromEntries(tableResults);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const files: BackupFileEntry[] = [];

  for (const bucket of PUBLIC_BUCKETS) {
    const paths = await listAllFiles(supabase, bucket);
    for (const path of paths) {
      files.push({ bucket, path, url: `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}` });
    }
  }

  for (const bucket of PRIVATE_BUCKETS) {
    const paths = await listAllFiles(supabase, bucket);
    for (const path of paths) {
      const { data } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);
      if (data?.signedUrl) files.push({ bucket, path, url: data.signedUrl });
    }
  }

  return { generatedAt: new Date().toISOString(), tables, files };
}
