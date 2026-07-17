'use client';

import { useState } from 'react';
import { Star, X } from 'lucide-react';
import { ReviewForm } from './ReviewForm';
import { useLanguage } from '@/lib/i18n/LanguageContext';

// A small floating round button (chat-bubble style) instead of an always-open
// form taking up space on the page — tapping it reveals the review form in
// an overlay. bottom-20 clears the fixed BottomNav bar on mobile app pages;
// harmless extra spacing on the public /p page, which has no bottom nav.
export function ReviewFormLauncher() {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t('write_a_review')}
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-lg transition hover:brightness-95 md:bottom-6"
      >
        <Star size={24} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
          onClick={() => setOpen(false)}
        >
          <div className="relative w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute -top-3 right-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-600 shadow-md dark:bg-slate-800 dark:text-slate-300"
            >
              <X size={18} />
            </button>
            <div className="max-h-[85vh] overflow-y-auto">
              <ReviewForm />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
