'use client';

import { useState } from 'react';
import { Pencil, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function AdminEditSection({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  const { t } = useLanguage();

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        <Pencil size={16} />
        {expanded ? t('hide_edit_options') : t('edit_profile')}
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {expanded && <div className="mt-4 space-y-4">{children}</div>}
    </div>
  );
}
