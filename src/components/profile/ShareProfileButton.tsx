'use client';

import { Share2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { ShopProfile } from '../../../types/database.types';

export function ShareProfileButton({ profile }: { profile: ShopProfile }) {
  const { t } = useLanguage();

  async function handleClick() {
    const url = `${window.location.origin}/p?src=share`;
    const text = `${profile.business_name}${profile.description ? ` — ${profile.description}` : ''}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: profile.business_name, text, url });
        return;
      } catch {
        // user cancelled the native share sheet — fall through to WhatsApp link
      }
    }

    window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`, '_blank', 'noopener,noreferrer');
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex items-center gap-2 rounded-xl border-2 border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
    >
      <Share2 size={18} /> {t('share_profile')}
    </button>
  );
}
