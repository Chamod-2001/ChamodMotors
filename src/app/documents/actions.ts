'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/queries/session';
import { logActivity } from '@/lib/activity';
import type { DocumentType } from '../../../types/database.types';

export interface DocumentActionResult {
  error?: string;
}

const DOCUMENT_TYPES: DocumentType[] = ['shop_letter', 'sale_letter', 'nic', 'electricity_bill', 'other'];

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

/** Builds a human-readable "<customer> — <vehicle>" suffix for activity log descriptions. */
async function describeDocumentContext(
  supabase: SupabaseServerClient,
  vehicleId?: string | null,
  customerId?: string | null
): Promise<string> {
  const [vehicle, customer] = await Promise.all([
    vehicleId
      ? supabase.from('vehicles').select('brand, model, registration_number').eq('id', vehicleId).single()
      : Promise.resolve({ data: null }),
    customerId
      ? supabase.from('customers').select('full_name').eq('id', customerId).single()
      : Promise.resolve({ data: null }),
  ]);

  const parts: string[] = [];
  if (customer.data?.full_name) parts.push(customer.data.full_name);
  if (vehicle.data) {
    const v = vehicle.data;
    parts.push(`${v.brand} ${v.model}${v.registration_number ? ` (${v.registration_number})` : ''}`);
  }
  return parts.join(' — ');
}

interface UploadDocumentInput {
  storagePath: string;
  documentType: string;
  vehicleId?: string;
  customerId?: string;
  revalidatePaths: string[];
}

/** Any active employee can attach a document to a vehicle/customer record. */
export async function uploadDocumentAction(input: UploadDocumentInput): Promise<DocumentActionResult> {
  const documentType = (DOCUMENT_TYPES as string[]).includes(input.documentType)
    ? (input.documentType as DocumentType)
    : 'other';

  if (!input.vehicleId && !input.customerId) {
    return { error: 'Document එකක් save කරන්න vehicle හෝ customer link කරන්න ඕන.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from('documents').insert({
    document_type: documentType,
    storage_path: input.storagePath,
    vehicle_id: input.vehicleId ?? null,
    customer_id: input.customerId ?? null,
    uploaded_by: user?.id ?? null,
  });

  if (error) {
    await supabase.storage.from('documents').remove([input.storagePath]);
    return { error: 'Document save කරන්න බැරි වුණා. නැවත උත්සාහ කරන්න.' };
  }

  const context = await describeDocumentContext(supabase, input.vehicleId, input.customerId);
  const label = documentType.replace('_', ' ');
  await logActivity(user?.id ?? null, 'document_uploaded', context ? `${label} — ${context}` : label);

  for (const path of input.revalidatePaths) revalidatePath(path);
  return {};
}

/** Only admins can remove an uploaded document (storage file + row). */
export async function deleteDocumentAction(documentId: string, storagePath: string, revalidatePaths: string[]) {
  await requireAdmin();
  const supabase = await createClient();

  const { data: doc } = await supabase
    .from('documents')
    .select('document_type, vehicle_id, customer_id')
    .eq('id', documentId)
    .single();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.storage.from('documents').remove([storagePath]);
  await supabase.from('documents').delete().eq('id', documentId);

  if (doc) {
    const context = await describeDocumentContext(supabase, doc.vehicle_id, doc.customer_id);
    const label = doc.document_type.replace('_', ' ');
    await logActivity(user?.id ?? null, 'document_deleted', context ? `${label} — ${context}` : label);
  }

  for (const path of revalidatePaths) revalidatePath(path);
}
