import type { SocialPlatform } from '../../types/database.types';

export const SOCIAL_PLATFORMS: { value: SocialPlatform; label: string; className: string }[] = [
  { value: 'facebook', label: 'Facebook', className: 'bg-blue-600 text-white' },
  { value: 'instagram', label: 'Instagram', className: 'bg-pink-600 text-white' },
  { value: 'tiktok', label: 'TikTok', className: 'bg-slate-900 text-white' },
  { value: 'youtube', label: 'YouTube', className: 'bg-red-600 text-white' },
  { value: 'website', label: 'Website', className: 'bg-brand text-white' },
  { value: 'other', label: 'Other', className: 'bg-slate-500 text-white' },
];

export function getSocialPlatformMeta(platform: SocialPlatform) {
  return SOCIAL_PLATFORMS.find((p) => p.value === platform) ?? SOCIAL_PLATFORMS[SOCIAL_PLATFORMS.length - 1];
}
