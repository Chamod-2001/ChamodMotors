'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Languages } from 'lucide-react';

const LABELS: Record<'english' | 'sinhala' | 'mixed', string> = {
  mixed: 'Mixed / මිශ්‍ර',
  english: 'English',
  sinhala: 'සිංහල',
};

export function LanguageSwitcher() {
  const { mode, setMode } = useLanguage();

  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1.5 dark:border-slate-700 dark:bg-slate-900">
      <Languages size={14} className="text-slate-500 dark:text-slate-400" />
      <select
        value={mode}
        onChange={(e) => setMode(e.target.value as 'english' | 'sinhala' | 'mixed')}
        className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none dark:text-slate-300"
        aria-label="Language / භාෂාව"
      >
        {(Object.keys(LABELS) as Array<keyof typeof LABELS>).map((key) => (
          <option key={key} value={key} className="dark:bg-slate-900">
            {LABELS[key]}
          </option>
        ))}
      </select>
    </div>
  );
}
