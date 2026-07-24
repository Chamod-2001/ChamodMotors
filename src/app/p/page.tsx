import { after } from 'next/server';
import { getShopProfile } from '@/lib/queries/shop';
import { listApprovedShopReviews } from '@/lib/queries/shopReviews';
import { logShopProfileView } from '@/lib/queries/shopAnalytics';
import { ShopProfileView } from '@/components/profile/ShopProfileView';
import { getTranslator } from '@/lib/i18n/server';

export const metadata = {
  title: 'Chamod Motors',
};

export default async function PublicShopProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ src?: string }>;
}) {
  const [{ profile, photos, socialLinks, locations, phoneNumbers }, reviews, t, { src }] = await Promise.all([
    getShopProfile(),
    listApprovedShopReviews(),
    getTranslator(),
    searchParams,
  ]);

  // Logging a view shouldn't delay the response the visitor is waiting on.
  after(() => logShopProfileView(src ?? null));

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950">
      <div className="mx-auto max-w-md">
        <ShopProfileView
          profile={profile}
          photos={photos}
          socialLinks={socialLinks}
          locations={locations}
          phoneNumbers={phoneNumbers}
          reviews={reviews}
        />
        <p className="mt-6 text-center text-xs text-slate-400">
          {t('powered_by')} {profile.business_name}
        </p>
      </div>
    </div>
  );
}
