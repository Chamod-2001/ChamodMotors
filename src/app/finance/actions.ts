'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { validateFinanceOfficerInput } from '@/lib/validation';
import { logActivity } from '@/lib/activity';

export interface FinanceActionResult {
  error?: string;
}

// ------------------------------------------------------------
// Finance Companies (admin manages)
// ------------------------------------------------------------
export async function createFinanceCompanyAction(formData: FormData): Promise<FinanceActionResult> {
  const name = String(formData.get('name') || '').trim();
  if (!name) return { error: 'සමාගමේ නම ඕන / Company name is required' };

  const supabase = await createClient();
  const { error } = await supabase.from('finance_companies').insert({ name });

  if (error) return { error: 'Company save කරන්න බැරි වුණා. ඔබට admin අවසර ඕන.' };

  revalidatePath('/finance');
  return {};
}

export async function deleteFinanceCompanyAction(companyId: string) {
  const supabase = await createClient();
  await supabase.from('finance_companies').delete().eq('id', companyId);
  revalidatePath('/finance');
}

// ------------------------------------------------------------
// Finance Officers (admin manages)
// ------------------------------------------------------------
export async function createFinanceOfficerAction(formData: FormData): Promise<FinanceActionResult> {
  const finance_company_id = String(formData.get('finance_company_id') || '');
  const officer_name = String(formData.get('officer_name') || '').trim();
  const phone_number = String(formData.get('phone_number') || '').trim();
  const whatsapp_number = String(formData.get('whatsapp_number') || '').trim();
  const notes = String(formData.get('notes') || '').trim();

  const validationError = validateFinanceOfficerInput({ finance_company_id, officer_name });
  if (validationError) return { error: validationError };

  const supabase = await createClient();
  const { error } = await supabase.from('finance_officers').insert({
    finance_company_id,
    officer_name,
    phone_number: phone_number || null,
    whatsapp_number: whatsapp_number || null,
    notes: notes || null,
  });

  if (error) return { error: 'Officer save කරන්න බැරි වුණා. ඔබට admin අවසර ඕන.' };

  revalidatePath('/finance');
  redirect('/finance');
}

export async function updateFinanceOfficerAction(officerId: string, formData: FormData): Promise<FinanceActionResult> {
  const officer_name = String(formData.get('officer_name') || '').trim();
  const phone_number = String(formData.get('phone_number') || '').trim();
  const whatsapp_number = String(formData.get('whatsapp_number') || '').trim();
  const notes = String(formData.get('notes') || '').trim();

  if (!officer_name) return { error: 'Officer නම ඕන / Officer name is required' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('finance_officers')
    .update({
      officer_name,
      phone_number: phone_number || null,
      whatsapp_number: whatsapp_number || null,
      notes: notes || null,
    })
    .eq('id', officerId);

  if (error) return { error: 'Officer update කරන්න බැරි වුණා. ඔබට admin අවසර ඕන.' };

  revalidatePath('/finance');
  revalidatePath(`/finance/${officerId}`);
  redirect(`/finance/${officerId}`);
}

export async function deleteFinanceOfficerAction(officerId: string) {
  const supabase = await createClient();
  await supabase.from('finance_officers').delete().eq('id', officerId);
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
