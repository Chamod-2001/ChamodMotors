import { createClient } from '@/lib/supabase/server';
import type { DocumentType, PartyRole } from '../../../types/database.types';

export interface DocumentItem {
  id: string;
  documentType: DocumentType;
  storagePath: string;
  createdAt: string;
  uploadedByName: string | null;
  signedUrl: string | null;
  partyRole: PartyRole | null;
}

type Row = {
  id: string;
  document_type: DocumentType;
  storage_path: string;
  created_at: string;
  party_role: PartyRole | null;
  profiles: { full_name: string } | { full_name: string }[] | null;
};

const one = <T,>(v: T | T[] | null): T | null => (Array.isArray(v) ? v[0] ?? null : v);

/** Lists documents attached to a vehicle and/or a customer, newest first, with a
 * short-lived signed URL for viewing (the `documents` storage bucket is private). */
export async function listDocuments({
  vehicleId,
  customerId,
}: {
  vehicleId?: string;
  customerId?: string;
}): Promise<DocumentItem[]> {
  const supabase = await createClient();
  let query = supabase
    .from('documents')
    .select('id, document_type, storage_path, created_at, party_role, profiles(full_name)')
    .order('created_at', { ascending: false });

  if (vehicleId) query = query.eq('vehicle_id', vehicleId);
  if (customerId) query = query.eq('customer_id', customerId);

  const { data } = await query;
  const rows = (data ?? []) as unknown as Row[];

  const signedUrls = await Promise.all(
    rows.map((row) => supabase.storage.from('documents').createSignedUrl(row.storage_path, 3600))
  );

  return rows.map((row, i) => ({
    id: row.id,
    documentType: row.document_type,
    storagePath: row.storage_path,
    createdAt: row.created_at,
    uploadedByName: one(row.profiles)?.full_name ?? null,
    signedUrl: signedUrls[i].data?.signedUrl ?? null,
    partyRole: row.party_role,
  }));
}
