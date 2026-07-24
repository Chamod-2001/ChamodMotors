'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { validateFinanceOfficerInput } from '@/lib/validation';
import { logActivity } from '@/lib/activity';
import { requireAdmin } from '@/lib/queries/session';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import { getShopBusinessName } from '@/lib/queries/shop';

export interface FinanceActionResult {
  error?: string;
}

// ------------------------------------------------------------
// Finance Companies (admin manages)
// ------------------------------------------------------------
export async function createFinanceCompanyAction(formData: FormData): Promise<FinanceActionResult> {
  await requireAdmin();
  const name = String(formData.get('name') || '').trim();
  const logoPath = String(formData.get('logoPath') || '').trim();
  if (!name) return { error: 'සමාගමේ නම ඕන / Company name is required' };

  const supabase = await createClient();
  const { error } = await supabase.from('finance_companies').insert({ name, logo_path: logoPath || null });

  if (error) return { error: 'Company save කරන්න බැරි වුණා. ඔබට admin අවසර ඕන.' };

  revalidatePath('/finance');
  return {};
}

export async function updateFinanceCompanyAction(companyId: string, formData: FormData): Promise<FinanceActionResult> {
  await requireAdmin();
  const name = String(formData.get('name') || '').trim();
  const logoPath = String(formData.get('logoPath') || '').trim();
  if (!name) return { error: 'සමාගමේ නම ඕන / Company name is required' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('finance_companies')
    .update({ name, logo_path: logoPath || null })
    .eq('id', companyId);

  if (error) return { error: 'Company update කරන්න බැරි වුණා. නැවත උත්සාහ කරන්න.' };

  revalidatePath('/finance');
  return {};
}

// Soft delete — keeps the officers' communication history correctly
// attributed instead of detaching it. Officers under this company are
// archived along with it so they also drop out of the active list.
export async function deleteFinanceCompanyAction(companyId: string): Promise<FinanceActionResult> {
  await requireAdmin();
  const supabase = await createClient();

  await supabase.from('finance_officers').update({ is_active: false }).eq('finance_company_id', companyId);
  const { error } = await supabase.from('finance_companies').update({ is_active: false }).eq('id', companyId);

  if (error) return { error: 'Company delete කරන්න බැරි වුණා. නැවත උත්සාහ කරන්න.' };
  revalidatePath('/finance');
  return {};
}

// ------------------------------------------------------------
// Finance Officers (admin manages)
// ------------------------------------------------------------
export async function createFinanceOfficerAction(formData: FormData): Promise<FinanceActionResult> {
  await requireAdmin();
  const finance_company_id = String(formData.get('finance_company_id') || '');
  const officer_name = String(formData.get('officer_name') || '').trim();
  const phone_number = String(formData.get('phone_number') || '').trim();
  const whatsapp_number = String(formData.get('whatsapp_number') || '').trim();
  const notes = String(formData.get('notes') || '').trim();
  const photoPath = String(formData.get('photoPath') || '').trim();

  const validationError = validateFinanceOfficerInput({ finance_company_id, officer_name });
  if (validationError) return { error: validationError };

  const supabase = await createClient();
  const { error } = await supabase.from('finance_officers').insert({
    finance_company_id,
    officer_name,
    phone_number: phone_number || null,
    whatsapp_number: whatsapp_number || null,
    notes: notes || null,
    photo_path: photoPath || null,
  });

  if (error) return { error: 'Officer save කරන්න බැරි වුණා. ඔබට admin අවසර ඕන.' };

  revalidatePath('/finance');
  redirect('/finance');
}

export async function updateFinanceOfficerAction(officerId: string, formData: FormData): Promise<FinanceActionResult> {
  await requireAdmin();
  const officer_name = String(formData.get('officer_name') || '').trim();
  const phone_number = String(formData.get('phone_number') || '').trim();
  const whatsapp_number = String(formData.get('whatsapp_number') || '').trim();
  const notes = String(formData.get('notes') || '').trim();
  const photoPath = String(formData.get('photoPath') || '').trim();

  if (!officer_name) return { error: 'Officer නම ඕන / Officer name is required' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('finance_officers')
    .update({
      officer_name,
      phone_number: phone_number || null,
      whatsapp_number: whatsapp_number || null,
      notes: notes || null,
      photo_path: photoPath || null,
    })
    .eq('id', officerId);

  if (error) return { error: 'Officer update කරන්න බැරි වුණා. ඔබට admin අවසර ඕන.' };

  revalidatePath('/finance');
  revalidatePath(`/finance/${officerId}`);
  redirect(`/finance/${officerId}`);
}

// Soft delete — keeps their communication history correctly attributed.
export async function deleteFinanceOfficerAction(officerId: string): Promise<FinanceActionResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from('finance_officers').update({ is_active: false }).eq('id', officerId);
  if (error) return { error: 'Officer delete කරන්න බැරි වුණා. නැවත උත්සාහ කරන්න.' };
  revalidatePath('/finance');
  redirect('/finance');
}

// ------------------------------------------------------------
// Communication log (any employee can add a note)
// ------------------------------------------------------------
export async function logFinanceCommunicationAction(
  officerId: string,
  formData: FormData
): Promise<FinanceActionResult> {
  const note = String(formData.get('note') || '').trim();
  const customerId = String(formData.get('customer_id') || '') || null;
  const vehicleId = String(formData.get('vehicle_id') || '') || null;

  if (!note) return { error: 'සටහනක් ලියන්න / Please write a note' };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from('finance_communications').insert({
    finance_officer_id: officerId,
    customer_id: customerId,
    vehicle_id: vehicleId,
    note,
    created_by: user?.id ?? null,
  });

  if (error) return { error: 'සටහන save කරන්න බැරි වුණා. නැවත උත්සාහ කරන්න.' };

  const { data: officer } = await supabase
    .from('finance_officers')
    .select('officer_name')
    .eq('id', officerId)
    .single();

  await logActivity(user?.id ?? null, 'finance_contact', officer?.officer_name ?? 'Finance officer');

  revalidatePath(`/finance/${officerId}`);
  return {};
}

// ------------------------------------------------------------
// Quick-action contact (WhatsApp / Call): the officer's number is looked
// up server-side and never sent to the client — the browser only ever
// receives the final wa.me/tel URL to open, not the number itself sitting
// in a rendered link. Each action also auto-logs what was done, so staff
// don't have to manually type a note every time they message or call.
// ------------------------------------------------------------
export type ContactKind = 'whatsapp_chat' | 'whatsapp_documents' | 'call';
export type DocumentKind = 'nic' | 'electricity_bill' | 'other';

export interface ContactOfficerResult {
  error?: string;
  url?: string;
}

const DOCUMENT_LABELS: Record<DocumentKind, string> = {
  nic: 'NIC copy',
  electricity_bill: 'Electricity bill',
  other: 'Document',
};

function buildDocumentMessage(officerName: string, documentLabel: string, businessName: string) {
  return `Hi ${officerName},\n\nසුභ දවසක්!\n\n${documentLabel} attach කර ඇත. කරුණාකර check කරලා update එකක් ලබා දෙන්න.\n\nThank you.\n\n${businessName}`;
}

/** Joins document labels the way a sentence would: "A", "A and B", "A, B and C". */
function joinLabels(labels: string[]) {
  if (labels.length <= 1) return labels.join('');
  return `${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}`;
}

export async function contactFinanceOfficerAction(
  officerId: string,
  kind: ContactKind,
  documentKinds?: DocumentKind[],
  customerId?: string,
  vehicleId?: string
): Promise<ContactOfficerResult> {
  if (kind === 'whatsapp_documents' && (!documentKinds || documentKinds.length === 0)) {
    return { error: 'අඩුම තරමින් document එකක් තෝරන්න.' };
  }

  const supabase = await createClient();
  const { data: officer } = await supabase
    .from('finance_officers')
    .select('officer_name, phone_number, whatsapp_number')
    .eq('id', officerId)
    .single();

  if (!officer) return { error: 'Officer හමු නොවීය.' };

  const contactNumber = officer.whatsapp_number || officer.phone_number;
  if (!contactNumber) return { error: 'මේ officer ට phone හෝ WhatsApp number නැත.' };

  let url: string;
  let logNote: string;

  if (kind === 'call') {
    url = `tel:${officer.phone_number || contactNumber}`;
    logNote = `Called ${officer.officer_name}`;
  } else if (kind === 'whatsapp_documents') {
    const businessName = await getShopBusinessName();
    const labels = (documentKinds ?? []).map((k) => DOCUMENT_LABELS[k]);
    const labelText = joinLabels(labels);
    url = buildWhatsAppLink(contactNumber, buildDocumentMessage(officer.officer_name, labelText, businessName));
    logNote = `Sent ${labelText} to ${officer.officer_name} via WhatsApp`;
  } else {
    url = buildWhatsAppLink(contactNumber);
    logNote = `Opened WhatsApp chat with ${officer.officer_name}`;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from('finance_communications').insert({
    finance_officer_id: officerId,
    customer_id: customerId || null,
    vehicle_id: vehicleId || null,
    note: logNote,
    created_by: user?.id ?? null,
  });

  await logActivity(user?.id ?? null, 'finance_contact', officer.officer_name);

  revalidatePath(`/finance/${officerId}`);
  return { url };
}
