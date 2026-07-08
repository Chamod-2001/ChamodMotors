'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { validateCustomerInput, validateSaleInput } from '@/lib/validation';
import { logActivity } from '@/lib/activity';
import { requireAdmin } from '@/lib/queries/session';

export interface CustomerFormResult {
  error?: string;
}

function parseCustomerInput(formData: FormData) {
  return {
    full_name: String(formData.get('full_name') || '').trim(),
    nic_number: String(formData.get('nic_number') || '').trim(),
    phone_number: String(formData.get('phone_number') || '').trim(),
    address: String(formData.get('address') || '').trim(),
    occupation: String(formData.get('occupation') || '').trim(),
  };
}

export async function createCustomerAction(formData: FormData): Promise<CustomerFormResult> {
  const input = parseCustomerInput(formData);

  const validationError = validateCustomerInput(input);
  if (validationError) return { error: validationError };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: customer, error } = await supabase
    .from('customers')
    .insert({
      full_name: input.full_name,
      nic_number: input.nic_number,
      phone_number: input.phone_number,
      address: input.address || null,
      occupation: input.occupation || null,
      created_by: user?.id ?? null,
    })
    .select('id')
    .single();

  if (error || !customer) {
    if (error?.code === '23505') {
      return { error: 'මේ NIC එකෙන් customer කෙනෙක් දැනටමත් ඉන්නවා / A customer with this NIC already exists' };
    }
    return { error: 'Customer save කරන්න බැරි වුණා. නැවත උත්සාහ කරන්න.' };
  }

  await logActivity(user?.id ?? null, 'customer_created', input.full_name);

  revalidatePath('/customers');
  redirect(`/customers/${customer.id}`);
}

export async function updateCustomerAction(customerId: string, formData: FormData): Promise<CustomerFormResult> {
  const input = parseCustomerInput(formData);

  const validationError = validateCustomerInput(input);
  if (validationError) return { error: validationError };

  const supabase = await createClient();
  const { error } = await supabase
    .from('customers')
    .update({
      full_name: input.full_name,
      nic_number: input.nic_number,
      phone_number: input.phone_number,
      address: input.address || null,
      occupation: input.occupation || null,
    })
    .eq('id', customerId);

  if (error) {
    if (error.code === '23505') {
      return { error: 'මේ NIC එකෙන් customer කෙනෙක් දැනටමත් ඉන්නවා / A customer with this NIC already exists' };
    }
    return { error: 'Customer update කරන්න බැරි වුණා. නැවත උත්සාහ කරන්න.' };
  }

  revalidatePath('/customers');
  revalidatePath(`/customers/${customerId}`);
  redirect(`/customers/${customerId}`);
}

export async function deleteCustomerAction(customerId: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from('customers').delete().eq('id', customerId);
  if (error) {
    return { error: 'Customer delete කරන්න බැරි වුණා. ඔබට admin අවසර ඕන.' };
  }
  revalidatePath('/customers');
  redirect('/customers');
}

export interface RecordSaleResult {
  error?: string;
}

/** Links a vehicle to a customer as a purchase, and marks the vehicle Sold */
export async function recordSaleAction(customerId: string, formData: FormData): Promise<RecordSaleResult> {
  const vehicleId = String(formData.get('vehicle_id') || '');
  const salePrice = Number(formData.get('sale_price') || 0);
  const purchaseDate = String(formData.get('purchase_date') || new Date().toISOString().slice(0, 10));

  const validationError = validateSaleInput({ vehicleId, salePrice });
  if (validationError) return { error: validationError };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error: saleError } = await supabase.from('sales').insert({
    vehicle_id: vehicleId,
    customer_id: customerId,
    sold_by: user?.id ?? null,
    sale_price: salePrice,
    purchase_date: purchaseDate,
  });

  if (saleError) {
    return { error: 'Sale record කරන්න බැරි වුණා. නැවත උත්සාහ කරන්න.' };
  }

  const { data: vehicle } = await supabase
    .from('vehicles')
    .update({ status: 'sold', sold_at: new Date(purchaseDate).toISOString(), reserved_at: null })
    .eq('id', vehicleId)
    .select('brand, model')
    .single();

  if (vehicle) {
    await logActivity(
      user?.id ?? null,
      'vehicle_sold',
      `${vehicle.brand} ${vehicle.model} — LKR ${salePrice.toLocaleString('en-LK')}`
    );
  }

  revalidatePath(`/customers/${customerId}`);
  revalidatePath('/vehicles');
  revalidatePath('/dashboard');
  return {};
}
