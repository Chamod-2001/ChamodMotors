import Image from 'next/image';
import { Phone, MapPin, Bike } from 'lucide-react';
import { getShopImagePublicUrl } from '@/lib/storageUrls';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import { getSocialPlatformMeta } from '@/lib/socialPlatforms';
import { getTranslator } from '@/lib/i18n/server';
import { Card } from '@/components/ui/Card';
import { SaveContactButton } from './SaveContactButton';
import { ShareProfileButton } from './ShareProfileButton';
import { PhotoGallery } from './PhotoGallery';
import { ReviewList } from './ReviewList';
import { ReviewFormLauncher } from './ReviewFormLauncher';
import { ImageLightboxProvider } from '@/components/ui/ImageLightbox';
import { CoverImageThumbnail } from './CoverImageThumbnail';
import logo from '@/assets/ChamodMotors.png';
import type { ShopProfile, ShopPhoto, ShopSocialLink, ShopLocation, ShopPhoneNumber } from '../../../types/database.types';
import type { ShopReviewItem } from '@/lib/queries/shopReviews';

function locationHref(location: ShopLocation) {
  return location.map_url || (location.address ? `https://maps.google.com/?q=${encodeURIComponent(location.address)}` : null);
}

export async function ShopProfileView({
  profile,
  photos,
  socialLinks = [],
  locations = [],
  phoneNumbers = [],
  reviews = [],
  showShare = false,
}: {
  profile: ShopProfile;
  photos: ShopPhoto[];
  socialLinks?: ShopSocialLink[];
  locations?: ShopLocation[];
  phoneNumbers?: ShopPhoneNumber[];
  reviews?: ShopReviewItem[];
  showShare?: boolean;
}) {
  const t = await getTranslator();

  return (
    <ImageLightboxProvider>
    <div className="space-y-4">
      <Card className="overflow-hidden !p-0">
        <div className="h-44 w-full bg-slate-100 dark:bg-slate-800">
          {profile.cover_photo_path ? (
            <CoverImageThumbnail url={getShopImagePublicUrl(profile.cover_photo_path)} alt={profile.business_name} />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-300">
              <Bike size={40} />
            </div>
          )}
        </div>

        <div className="p-5 text-center">
          <Image
            src={logo}
            alt={profile.business_name}
            className="mx-auto -mt-10 mb-2 h-20 w-44 rounded-2xl border-4 border-white bg-white object-contain shadow dark:border-slate-900 dark:bg-slate-900"
          />
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{profile.business_name}</h1>
          {profile.description && (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{profile.description}</p>
          )}
        </div>

        <div className="flex gap-2 border-t border-slate-100 p-3 dark:border-slate-800">
          {profile.whatsapp_number && (
            <a
              href={buildWhatsAppLink(profile.whatsapp_number, `Hi ${profile.business_name}, `)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 flex-col items-center gap-1.5 rounded-xl bg-emerald-50 py-3 text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400"
            >
              <svg viewBox="0 0 24 24" width={22} height={22} fill="currentColor" aria-hidden="true">
                <path d="M12.04 2c-5.52 0-10 4.48-10 10 0 1.77.46 3.45 1.27 4.9L2 22l5.25-1.38a9.96 9.96 0 0 0 4.79 1.22h.01c5.52 0 10-4.48 10-10s-4.48-10-10.01-10Zm5.86 14.16c-.25.7-1.45 1.34-2 1.42-.51.08-1.15.11-1.86-.12-.43-.13-.98-.32-1.68-.62-2.96-1.28-4.89-4.26-5.04-4.46-.15-.2-1.2-1.6-1.2-3.05 0-1.45.76-2.16 1.03-2.46.27-.3.59-.37.79-.37.2 0 .4 0 .57.01.18.01.43-.07.67.51.25.6.85 2.06.92 2.21.07.15.12.33.02.53-.1.2-.15.33-.3.5-.15.18-.31.4-.45.54-.15.15-.3.31-.13.61.17.3.76 1.25 1.63 2.02 1.12 1 2.06 1.31 2.36 1.46.3.15.48.13.65-.08.18-.2.75-.87.95-1.17.2-.3.4-.25.67-.15.28.1 1.76.83 2.06.98.3.15.5.23.57.35.08.13.08.7-.17 1.4Z" />
              </svg>
              <span className="text-xs font-semibold">WhatsApp</span>
            </a>
          )}
          {profile.phone_number && (
            <a
              href={`tel:${profile.phone_number}`}
              className="flex flex-1 flex-col items-center gap-1.5 rounded-xl bg-brand-light py-3 text-brand-dark transition hover:brightness-95 dark:text-brand"
            >
              <Phone size={22} />
              <span className="text-xs font-semibold">{t('call')}</span>
            </a>
          )}
          <SaveContactButton profile={profile} phoneNumbers={phoneNumbers} />
        </div>
      </Card>

      {phoneNumbers.length > 0 && (
        <div className="space-y-2">
          {phoneNumbers.map((p) => (
            <a
              key={p.id}
              href={`tel:${p.phone_number}`}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
            >
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{p.label || t('phone_number')}</span>
              <span className="flex items-center gap-1.5 text-sm font-semibold text-brand-dark dark:text-brand">
                <Phone size={16} /> {p.phone_number}
              </span>
            </a>
          ))}
        </div>
      )}

      {locations.length > 0 && (
        <div className="space-y-2">
          {locations.map((location) => {
            const directionsHref = locationHref(location);
            return (
              <div
                key={location.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand">
                    <MapPin size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{location.label}</p>
                    {location.address && (
                      <p className="truncate text-sm text-slate-500 dark:text-slate-400">{location.address}</p>
                    )}
                  </div>
                </div>

                {(directionsHref || location.google_review_url) && (
                  <div className="mt-3 flex gap-2">
                    {directionsHref && (
                      <a
                        href={directionsHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 rounded-xl bg-brand-light py-2 text-center text-xs font-semibold text-brand-dark transition hover:brightness-95"
                      >
                        {t('get_directions')}
                      </a>
                    )}
                    {location.google_review_url && (
                      <a
                        href={location.google_review_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 rounded-xl bg-amber-50 py-2 text-center text-xs font-semibold text-amber-700 transition hover:brightness-95"
                      >
                        {t('leave_review')}
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {socialLinks.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          {socialLinks.map((link) => {
            const meta = getSocialPlatformMeta(link.platform);
            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition hover:brightness-95 ${meta.className}`}
              >
                <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" aria-hidden="true">
                  <path d={meta.iconPath} />
                </svg>
                {meta.label}
              </a>
            );
          })}
        </div>
      )}

      {photos.length > 0 && <PhotoGallery photos={photos} title={t('photos')} />}

      <ReviewList reviews={reviews} />
      <ReviewFormLauncher />

      {showShare && (
        <div className="flex justify-center">
          <ShareProfileButton profile={profile} />
        </div>
      )}
    </div>
    </ImageLightboxProvider>
  );
}
