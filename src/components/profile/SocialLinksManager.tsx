'use client';

import { useRef, useState, useTransition } from 'react';
import { X } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { addShopSocialLinkAction, deleteShopSocialLinkAction } from '@/app/profile/actions';
import { SOCIAL_PLATFORMS, getSocialPlatformMeta } from '@/lib/socialPlatforms';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { ShopSocialLink, SocialPlatform } from '../../../types/database.types';

export function SocialLinksManager({ links }: { links: ShopSocialLink[] }) {
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const { t } = useLanguage();

  async function handleAdd(formData: FormData) {
    setError(undefined);
    const platform = String(formData.get('platform') || 'other') as SocialPlatform;
    const url = String(formData.get('url') || '');

    startTransition(async () => {
      const result = await addShopSocialLinkAction(platform, url);
      if (result?.error) setError(result.error);
      else formRef.current?.reset();
    });
  }

  function handleDelete(linkId: string) {
    startTransition(async () => {
      await deleteShopSocialLinkAction(linkId);
    });
  }

  return (
    <div className="space-y-3">
      {links.length > 0 && (
        <ul className="space-y-2">
          {links.map((link) => {
            const meta = getSocialPlatformMeta(link.platform);
            return (
              <li key={link.id} className="flex items-center gap-2 rounded-xl border border-slate-200 p-2 dark:border-slate-700">
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${meta.className}`}>
                  {meta.label}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-slate-600 dark:text-slate-400">{link.url}</span>
                <button
                  type="button"
                  onClick={() => handleDelete(link.id)}
                  disabled={isPending}
                  className="shrink-0 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-red-600 disabled:opacity-50 dark:hover:bg-slate-800"
                  aria-label={t('remove_link')}
                >
                  <X size={16} />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <form ref={formRef} action={handleAdd} className="grid gap-2 sm:grid-cols-[10rem_1fr_auto]">
        <Select name="platform" defaultValue="facebook">
          {SOCIAL_PLATFORMS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </Select>
        <Input name="url" type="url" placeholder="https://..." required />
        <Button type="submit" disabled={isPending} className="!min-h-0 !py-3">
          {t('add')}
        </Button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
