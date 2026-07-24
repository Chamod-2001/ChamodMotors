import type { SocialPlatform } from '../../types/database.types';

// Tinted background + brand-tone text (not solid brand-color fill) so these
// read as subtle pills, not loud buttons — plus an actual logo mark per
// platform (a plain .ts file can't contain JSX, so this hands over raw SVG
// path data; ShopProfileView renders the <svg> itself, same as the existing
// hand-inlined WhatsApp icon there).
export const SOCIAL_PLATFORMS: { value: SocialPlatform; label: string; className: string; iconPath: string }[] = [
  {
    value: 'facebook',
    label: 'Facebook',
    className: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
    iconPath:
      'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  },
  {
    value: 'instagram',
    label: 'Instagram',
    className: 'bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400',
    iconPath:
      'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
  },
  {
    value: 'tiktok',
    label: 'TikTok',
    className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    iconPath:
      'M16.6 5.82c-1.01-.85-1.72-2.02-1.94-3.35a4.9 4.9 0 0 1-.06-.47h-3.06v13.9c0 1.53-1.24 2.77-2.77 2.77s-2.77-1.24-2.77-2.77 1.24-2.77 2.77-2.77c.29 0 .57.05.83.13v-3.13a5.9 5.9 0 0 0-.83-.06A5.9 5.9 0 0 0 3 16.9a5.9 5.9 0 0 0 5.77 5.9 5.9 5.9 0 0 0 5.9-5.9V9.4a8.28 8.28 0 0 0 4.83 1.55V7.9a4.85 4.85 0 0 1-3-2.08z',
  },
  {
    value: 'youtube',
    label: 'YouTube',
    className: 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400',
    iconPath:
      'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
  },
  {
    value: 'website',
    label: 'Website',
    className: 'bg-brand-light text-brand-dark',
    iconPath:
      'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm7.94 9h-3.06a15.4 15.4 0 0 0-1.2-5.44A8.02 8.02 0 0 1 19.94 11zM12 4.06c.83 1.2 1.94 3.2 2.24 4.94H9.76c.3-1.74 1.41-3.74 2.24-4.94zM4.06 13H7.1c.13 1.9.57 3.75 1.2 5.44A8.02 8.02 0 0 1 4.06 13zm0-2A8.02 8.02 0 0 1 8.3 4.56C7.67 6.25 7.23 8.1 7.1 10H4.06zM12 19.94c-.83-1.2-1.94-3.2-2.24-4.94h4.48c-.3 1.74-1.41 3.74-2.24 4.94zM14.7 13H9.3c-.15-1.28-.15-2.72 0-4h5.4c.15 1.28.15 2.72 0 4zm1.04 5.44c.63-1.69 1.07-3.54 1.2-5.44h3.06a8.02 8.02 0 0 1-4.26 5.44z',
  },
  {
    value: 'other',
    label: 'Other',
    className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    iconPath:
      'M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z',
  },
];

export function getSocialPlatformMeta(platform: SocialPlatform) {
  return SOCIAL_PLATFORMS.find((p) => p.value === platform) ?? SOCIAL_PLATFORMS[SOCIAL_PLATFORMS.length - 1];
}
