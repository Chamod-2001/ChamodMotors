import { getShopProfile } from '@/lib/queries/shop';
import { ShopProfileView } from '@/components/profile/ShopProfileView';
import { getTranslator } from '@/lib/i18n/server';

export const metadata = {
  title: 'Chamod Motors',
};

export default async function PublicShopProfilePage() {
  const { profile, photos, socialLinks, locations } = await getShopProfile();
  const t = await getTranslator();

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950">
      <div className="mx-auto max-w-md">
        <ShopProfileView profile={profile} photos={photos} socialLinks={socialLinks} locations={locations} />
        <p className="mt-6 text-center text-xs text-slate-400">
          {t('powered_by')} {profile.business_name}
        </p>
      </div>
    </div>
  );
}
