'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/queries/session';
import type { SocialPlatform } from '../../../types/database.types';

export interface ProfileActionResult {
  error?: string;
}

export async function updateShopProfileAction(formData: FormData): Promise<ProfileActionResult> {
  await requireAdmin();

  const business_name = String(formData.get('business_name') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const phone_number = String(formData.get('phone_number') || '').trim();
  const whatsapp_number = String(formData.get('whatsapp_number') || '').trim();

  if (!business_name) {
    return { error: 'Business name is required' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('shop_profile')
    .update({
      business_name,
      description: description || null,
      phone_number: phone_number || null,
      whatsapp_number: whatsapp_number || null,
    })
    .eq('id', true);

  if (error) {
    return { error: 'Profile save කරන්න බැරි වුණා. නැවත උත්සාහ කරන්න.' };
  }

  revalidatePath('/profile');
  revalidatePath('/p');
  return {};
}

export async function setShopCoverPhotoAction(storagePath: string): Promise<ProfileActionResult> {
  await requireAdmin();

  const supabase = await createClient();
  const { error } = await supabase.from('shop_profile').update({ cover_photo_path: storagePath }).eq('id', true);

  if (error) {
    return { error: 'Cover photo save කරන්න බැරි වුණා.' };
  }

  revalidatePath('/profile');
  revalidatePath('/p');
  return {};
}

export async function addShopPhotoAction(storagePath: string): Promise<ProfileActionResult> {
  await requireAdmin();

  const supabase = await createClient();
  const { count } = await supabase.from('shop_photos').select('*', { count: 'exact', head: true });

  const { error } = await supabase.from('shop_photos').insert({ storage_path: storagePath, sort_order: count ?? 0 });

  if (error) {
    return { error: 'Photo save කරන්න බැරි වුණා.' };
  }

  revalidatePath('/profile');
  revalidatePath('/p');
  return {};
}

export async function deleteShopPhotoAction(photoId: string, storagePath: string) {
  await requireAdmin();

  const supabase = await createClient();
  await supabase.storage.from('shop-photos').remove([storagePath]);
  await supabase.from('shop_photos').delete().eq('id', photoId);

  revalidatePath('/profile');
  revalidatePath('/p');
}

export async function addShopSocialLinkAction(platform: SocialPlatform, url: string): Promise<ProfileActionResult> {
  await requireAdmin();

  const trimmed = url.trim();
  if (!trimmed) return { error: 'URL is required' };

  const supabase = await createClient();
  const { count } = await supabase.from('shop_social_links').select('*', { count: 'exact', head: true });

  const { error } = await supabase
    .from('shop_social_links')
    .insert({ platform, url: trimmed, sort_order: count ?? 0 });

  if (error) {
    return { error: 'Link save කරන්න බැරි වුණා.' };
  }

  revalidatePath('/profile');
  revalidatePath('/p');
  return {};
}

export async function deleteShopSocialLinkAction(linkId: string) {
  await requireAdmin();

  const supabase = await createClient();
  await supabase.from('shop_social_links').delete().eq('id', linkId);

  revalidatePath('/profile');
  revalidatePath('/p');
}

export async function addShopLocationAction(formData: FormData): Promise<ProfileActionResult> {
  await requireAdmin();

  const label = String(formData.get('label') || '').trim();
  const address = String(formData.get('address') || '').trim();
  const map_url = String(formData.get('map_url') || '').trim();

  if (!label) return { error: 'City/branch name is required' };
  if (!address && !map_url) return { error: 'Add an address or a Google Maps link' };

  const supabase = await createClient();
  const { count } = await supabase.from('shop_locations').select('*', { count: 'exact', head: true });

  const { error } = await supabase.from('shop_locations').insert({
    label,
    address: address || null,
    map_url: map_url || null,
    sort_order: count ?? 0,
  });

  if (error) {
    return { error: 'Location save කරන්න බැරි වුණා.' };
  }

  revalidatePath('/profile');
  revalidatePath('/p');
  return {};
}

export async function deleteShopLocationAction(locationId: string) {
  await requireAdmin();

  const supabase = await createClient();
  await supabase.from('shop_locations').delete().eq('id', locationId);

  revalidatePath('/profile');
  revalidatePath('/p');
}
