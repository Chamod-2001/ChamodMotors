import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import { formatLocalDate } from '@/lib/calculations';

/** Logs one visit to the public /p share page — approximate city/country
 * come from Vercel's edge geo headers (free, no external service; absent
 * outside Vercel, e.g. local dev, in which case they're just null). Called
 * via after() from the page so it never delays the response. */
export async function logShopProfileView(source: string | null): Promise<void> {
  try {
    const supabase = await createClient();
    const h = await headers();
    const country = h.get('x-vercel-ip-country');
    const cityRaw = h.get('x-vercel-ip-city');
    const city = cityRaw ? decodeURIComponent(cityRaw) : null;

    const { error } = await supabase.from('shop_profile_views').insert({ country, city, source: source || null });
    // Runs after the response via after() — nothing downstream is waiting on
    // this, so swallow failures (e.g. migration not applied yet) rather than
    // letting an unhandled rejection surface as a server log error for every
    // single page view.
    if (error) console.error('[shop_profile_views] insert failed:', error.message);
  } catch (err) {
    console.error('[shop_profile_views] logging failed:', err);
  }
}

export interface ShopProfileViewStats {
  totalViews: number;
  todayViews: number;
  last7DaysViews: number;
  last30DaysViews: number;
  dailyCounts: { date: string; count: number }[];
  topLocations: { label: string; count: number }[];
  topSources: { source: string; count: number }[];
}

export async function getShopProfileViewStats(): Promise<ShopProfileViewStats> {
  const supabase = await createClient();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thirtyDaysAgo = new Date(todayStart);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  const sevenDaysAgo = new Date(todayStart);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const [{ count: totalViews }, { data }] = await Promise.all([
    supabase.from('shop_profile_views').select('*', { count: 'exact', head: true }),
    supabase
      .from('shop_profile_views')
      .select('viewed_at, country, city, source')
      .gte('viewed_at', thirtyDaysAgo.toISOString())
      .order('viewed_at', { ascending: false }),
  ]);

  type Row = { viewed_at: string; country: string | null; city: string | null; source: string | null };
  const rows = (data ?? []) as Row[];

  let todayViews = 0;
  let last7DaysViews = 0;
  const dayMap = new Map<string, number>();
  const locationMap = new Map<string, number>();
  const sourceMap = new Map<string, number>();

  for (const row of rows) {
    const viewedAt = new Date(row.viewed_at);
    if (viewedAt >= todayStart) todayViews += 1;
    if (viewedAt >= sevenDaysAgo) last7DaysViews += 1;

    const dayKey = formatLocalDate(viewedAt);
    dayMap.set(dayKey, (dayMap.get(dayKey) ?? 0) + 1);

    if (row.city || row.country) {
      const label = [row.city, row.country].filter(Boolean).join(', ');
      locationMap.set(label, (locationMap.get(label) ?? 0) + 1);
    }

    if (row.source) {
      sourceMap.set(row.source, (sourceMap.get(row.source) ?? 0) + 1);
    }
  }

  const dailyCounts = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date(todayStart);
    d.setDate(d.getDate() - (13 - i));
    const key = formatLocalDate(d);
    return { date: key, count: dayMap.get(key) ?? 0 };
  });

  const topLocations = Array.from(locationMap.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const topSources = Array.from(sourceMap.entries())
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalViews: totalViews ?? 0,
    todayViews,
    last7DaysViews,
    last30DaysViews: rows.length,
    dailyCounts,
    topLocations,
    topSources,
  };
}
