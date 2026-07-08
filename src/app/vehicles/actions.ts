'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { validateVehicleInput } from '@/lib/validation';
import { requireAdmin } from '@/lib/queries/session';
import { logActivity } from '@/lib/activity';
import type {
  VehicleType,
  FuelType,
  VehicleStatus,
} from '../../../types/database.types';

export interface VehicleFormResult {
  error?: string;
}

function statusTimestamps(status: VehicleStatus) {
  const now = new Date().toISOString();
  return {
    reserved_at: status === 'reserved' ? now : null,
    sold_at: status === 'sold' ? now : null,
  };
}

export interface VehicleFormInput {
  brand: string;
  model: string;
  manufacturing_year: string;
  vehicle_type: VehicleType;
  registration_number: string;
  engine_number: string;
  chassis_number: string;
  mileage: string;
  fuel_type: FuelType | '';
  color: string;
  buying_price: string;
  selling_price: string;
  status: VehicleStatus;
  notes: string;
  buying_date: string;
  imagePaths: string[]; // already-uploaded storage paths, first one is primary
}

function parseFormInput(formData: FormData): VehicleFormInput {
  return {
    brand: String(formData.get('brand') || '').trim(),
    model: String(formData.get('model') || '').trim(),
    manufacturing_year: String(formData.get('manufacturing_year') || ''),
    vehicle_type: (String(formData.get('vehicle_type') || 'motorcycle')) as VehicleType,
    registration_number: String(formData.get('registration_number') || '').trim(),
    engine_number: String(formData.get('engine_number') || '').trim(),
    chassis_number: String(formData.get('chassis_number') || '').trim(),
    mileage: String(formData.get('mileage') || ''),
    fuel_type: (String(formData.get('fuel_type') || '')) as FuelType | '',
    color: String(formData.get('color') || '').trim(),
    buying_price: String(formData.get('buying_price') || '0'),
    selling_price: String(formData.get('selling_price') || '0'),
    status: (String(formData.get('status') || 'available')) as VehicleStatus,
    notes: String(formData.get('notes') || '').trim(),
    buying_date: String(formData.get('buying_date') || new Date().toISOString().slice(0, 10)),
    imagePaths: formData.getAll('imagePaths').map(String).filter(Boolean),
  };
}

export async function createVehicleAction(formData: FormData): Promise<VehicleFormResult> {
  await requireAdmin();
  const input = parseFormInput(formData);

  const validationError = validateVehicleInput(input);
  if (validationError) return { error: validationError };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: vehicle, error } = await supabase
    .from('vehicles')
    .insert({
      brand: input.brand,
      model: input.model,
      manufacturing_year: input.manufacturing_year ? Number(input.manufacturing_year) : null,
      vehicle_type: input.vehicle_type,
      registration_number: input.registration_number || null,
      engine_number: input.engine_number || null,
      chassis_number: input.chassis_number || null,
      mileage: input.mileage ? Number(input.mileage) : null,
      fuel_type: input.fuel_type || null,
      color: input.color || null,
      buying_price: Number(input.buying_price) || 0,
      selling_price: Number(input.selling_price) || 0,
      status: input.status,
      notes: input.notes || null,
      buying_date: input.buying_date,
      ...statusTimestamps(input.status),
      created_by: user?.id ?? null,
    })
    .select('id')
    .single();

  if (error || !vehicle) {
    return { error: 'වාහනය save කරන්න බැරි වුණා. නැවත උත්සාහ කරන්න.' };
  }

  if (input.imagePaths.length > 0) {
    const imageRows = input.imagePaths.map((path, index) => ({
      vehicle_id: vehicle.id,
      storage_path: path,
      is_primary: index === 0,
      sort_order: index,
    }));
    await supabase.from('vehicle_images').insert(imageRows);
  }

  await logActivity(user?.id ?? null, 'vehicle_created', `${input.brand} ${input.model}`);

  revalidatePath('/vehicles');
  redirect(`/vehicles/${vehicle.id}`);
}

export async function updateVehicleAction(vehicleId: string, formData: FormData): Promise<VehicleFormResult> {
  await requireAdmin();
  const input = parseFormInput(formData);

  const validationError = validateVehicleInput(input);
  if (validationError) return { error: validationError };

  const supabase = await createClient();

  const { data: existing } = await supabase.from('vehicles').select('status').eq('id', vehicleId).single();
  const statusChanged = existing && existing.status !== input.status;

  const { error } = await supabase
    .from('vehicles')
    .update({
      brand: input.brand,
      model: input.model,
      manufacturing_year: input.manufacturing_year ? Number(input.manufacturing_year) : null,
      vehicle_type: input.vehicle_type,
      registration_number: input.registration_number || null,
      engine_number: input.engine_number || null,
      chassis_number: input.chassis_number || null,
      mileage: input.mileage ? Number(input.mileage) : null,
      fuel_type: input.fuel_type || null,
      color: input.color || null,
      buying_price: Number(input.buying_price) || 0,
      selling_price: Number(input.selling_price) || 0,
      status: input.status,
      notes: input.notes || null,
      buying_date: input.buying_date,
      ...(statusChanged ? statusTimestamps(input.status) : {}),
    })
    .eq('id', vehicleId);

  if (error) {
    return { error: 'වාහනය update කරන්න බැරි වුණා. නැවත උත්සාහ කරන්න.' };
  }

  // Newly added images (existing ones are managed separately via deleteVehicleImageAction)
  if (input.imagePaths.length > 0) {
    const { count } = await supabase
      .from('vehicle_images')
      .select('*', { count: 'exact', head: true })
      .eq('vehicle_id', vehicleId);

    const startIndex = count ?? 0;
    const imageRows = input.imagePaths.map((path, index) => ({
      vehicle_id: vehicleId,
      storage_path: path,
      is_primary: startIndex === 0 && index === 0,
      sort_order: startIndex + index,
    }));
    await supabase.from('vehicle_images').insert(imageRows);
  }

  revalidatePath('/vehicles');
  revalidatePath(`/vehicles/${vehicleId}`);
  redirect(`/vehicles/${vehicleId}`);
}

export async function updateVehicleStatusAction(vehicleId: string, status: VehicleStatus) {
  const supabase = await createClient();
  const { data: vehicle } = await supabase
    .from('vehicles')
    .update({ status, ...statusTimestamps(status) })
    .eq('id', vehicleId)
    .select('brand, model')
    .single();

  if (status === 'sold' && vehicle) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await logActivity(user?.id ?? null, 'vehicle_sold', `${vehicle.brand} ${vehicle.model}`);
  }

  revalidatePath('/vehicles');
  revalidatePath(`/vehicles/${vehicleId}`);
}

export async function deleteVehicleImageAction(imageId: string, storagePath: string, vehicleId: string) {
  const supabase = await createClient();
  await supabase.storage.from('vehicle-images').remove([storagePath]);
  await supabase.from('vehicle_images').delete().eq('id', imageId);
  revalidatePath(`/vehicles/${vehicleId}`);
  revalidatePath(`/vehicles/${vehicleId}/edit`);
}

export async function deleteVehicleAction(vehicleId: string) {
  await requireAdmin();
  const supabase = await createClient();

  // Clean up storage files first (admin-only per RLS policy)
  const { data: images } = await supabase
    .from('vehicle_images')
    .select('storage_path')
    .eq('vehicle_id', vehicleId);

  if (images && images.length > 0) {
    await supabase.storage.from('vehicle-images').remove(images.map((img) => img.storage_path));
  }

  const { error } = await supabase.from('vehicles').delete().eq('id', vehicleId);
  if (error) {
    return { error: 'වාහනය delete කරන්න බැරි වුණා. ඔබට admin අවසර ඕන.' };
  }

  revalidatePath('/vehicles');
  redirect('/vehicles');
}
