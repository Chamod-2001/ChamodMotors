import { getCurrentEmployee } from '@/lib/queries/session';
import { getShopProfile } from '@/lib/queries/shop';
import { listApprovedShopReviews, listPendingShopReviews } from '@/lib/queries/shopReviews';
import { getTranslator } from '@/lib/i18n/server';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { ShopProfileView } from '@/components/profile/ShopProfileView';
import { ShopProfileEditForm } from '@/components/profile/ShopProfileEditForm';
import { ShopPhotoManager } from '@/components/profile/ShopPhotoManager';
import { SocialLinksManager } from '@/components/profile/SocialLinksManager';
import { ShopLocationsManager } from '@/components/profile/ShopLocationsManager';
import { ShopPhoneNumbersManager } from '@/components/profile/ShopPhoneNumbersManager';
import { ReviewModerationList } from '@/components/profile/ReviewModerationList';
import { ProfileQRCode } from '@/components/profile/ProfileQRCode';
import { AdminEditSection } from '@/components/profile/AdminEditSection';

export default async function ProfilePage() {
  const employee = await getCurrentEmployee();
  const isAdmin = employee?.role === 'admin';
  const [{ profile, photos, socialLinks, locations, phoneNumbers }, approvedReviews, pendingReviews, t] = await Promise.all([
    getShopProfile(),
    listApprovedShopReviews(),
    isAdmin ? listPendingShopReviews() : Promise.resolve([]),
    getTranslator(),
  ]);

  return (
    <AppShell title={t('profile')}>
      <div className="mx-auto max-w-2xl space-y-4 p-4">
        <ShopProfileView
          profile={profile}
          photos={photos}
          socialLinks={socialLinks}
          locations={locations}
          phoneNumbers={phoneNumbers}
          reviews={approvedReviews}
          showShare
        />

        <ProfileQRCode />

        {isAdmin && (
          <Card id="pending-reviews">
            <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
              {t('pending_reviews_label')} ({pendingReviews.length})
            </h2>
            <ReviewModerationList reviews={pendingReviews} showApprove emptyMessage={t('no_pending_reviews')} />
          </Card>
        )}

        {isAdmin && approvedReviews.length > 0 && (
          <Card>
            <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">{t('published_reviews_label')}</h2>
            <ReviewModerationList reviews={approvedReviews} showApprove={false} emptyMessage={t('no_published_reviews')} />
          </Card>
        )}

        {isAdmin && (
          <AdminEditSection>
            <Card>
              <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">{t('edit_business_profile')}</h2>
              <ShopProfileEditForm profile={profile} />
            </Card>

            <Card>
              <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">{t('photos')}</h2>
              <ShopPhotoManager coverPhotoPath={profile.cover_photo_path} photos={photos} />
            </Card>

            <Card>
              <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">{t('locations_label')}</h2>
              <ShopLocationsManager locations={locations} />
            </Card>

            <Card>
              <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">{t('additional_phone_numbers_label')}</h2>
              <ShopPhoneNumbersManager phoneNumbers={phoneNumbers} />
            </Card>

            <Card>
              <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">{t('social_media_label')}</h2>
              <SocialLinksManager links={socialLinks} />
            </Card>
          </AdminEditSection>
        )}
      </div>
    </AppShell>
  );
}
