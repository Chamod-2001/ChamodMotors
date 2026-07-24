import { createClient } from '@/lib/supabase/server';
import type { ShopProfile, ShopPhoto, ShopSocialLink, ShopLocation, ShopPhoneNumber } from '../../../types/database.types';

export interface ShopProfileData {
  profile: ShopProfile;
  photos: ShopPhoto[];
  socialLinks: ShopSocialLink[];
  locations: ShopLocation[];
  phoneNumbers: ShopPhoneNumber[];
}

// Public data (RLS allows anyone to read these tables), used by both the
// in-app /profile page and the unauthenticated /p share page.
export async function getShopProfile(): Promise<ShopProfileData> {
  const supabase = await createClient();

  const [{ data: profile }, { data: photos }, { data: socialLinks }, { data: locations }, { data: phoneNumbers }] =
    await Promise.all([
      supabase.from('shop_profile').select('*').eq('id', true).single(),
      supabase.from('shop_photos').select('*').order('sort_order', { ascending: true }),
      supabase.from('shop_social_links').select('*').order('sort_order', { ascending: true }),
      supabase.from('shop_locations').select('*').order('sort_order', { ascending: true }),
      supabase.from('shop_phone_numbers').select('*').order('sort_order', { ascending: true }),
    ]);

  return {
    profile: (profile as ShopProfile) ?? {
      id: true,
      business_name: 'Chamod Motors',
      description: null,
      phone_number: null,
      whatsapp_number: null,
      address: null,
      map_url: null,
      cover_photo_path: null,
      updated_at: new Date().toISOString(),
    },
    photos: (photos as ShopPhoto[]) ?? [],
    socialLinks: (socialLinks as ShopSocialLink[]) ?? [],
    locations: (locations as ShopLocation[]) ?? [],
    phoneNumbers: (phoneNumbers as ShopPhoneNumber[]) ?? [],
  };
}

/** Just the business name — for places (like WhatsApp message templates) that
 * don't need the full profile/photos/locations fetch. */
export async function getShopBusinessName(): Promise<string> {
  const supabase = await createClient();
  const { data } = await supabase.from('shop_profile').select('business_name').eq('id', true).single();
  return data?.business_name ?? 'Chamod Motors';
}
