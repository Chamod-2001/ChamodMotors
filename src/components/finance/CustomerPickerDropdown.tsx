'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, Search, User, X } from 'lucide-react';
import { getCustomerPhotoPublicUrl } from '@/lib/storageUrls';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { SimpleCustomer } from '@/lib/queries/finance';

/** A native <select> can't show a photo per option, and when several
 * customers share a name that's exactly when mix-ups happen — this shows
 * a photo + NIC alongside each name, both in the closed state and the list. */
export function CustomerPickerDropdown({
  customers,
  name = 'customer_id',
  onValueChange,
}: {
  customers: SimpleCustomer[];
  name?: string;
  /** Optional — for use outside a <form> (e.g. triggering a server action
   * directly on click) where a hidden form field alone isn't enough. */
  onValueChange?: (id: string) => void;
}) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('');

  const selected = customers.find((c) => c.id === selectedId);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) => c.full_name.toLowerCase().includes(q) || c.nic_number.toLowerCase().includes(q));
  }, [customers, query]);

  function select(id: string) {
    setSelectedId(id);
    setOpen(false);
    setQuery('');
    onValueChange?.(id);
  }

  return (
    <div className="relative">
      <input type="hidden" name={name} value={selectedId} />
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center gap-2 rounded-xl border-2 border-slate-200 px-3 py-2.5 text-sm dark:border-slate-700"
      >
        {selected ? (
          <>
            <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-light text-brand">
              {selected.photo_path ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={getCustomerPhotoPublicUrl(selected.photo_path)} alt="" className="h-full w-full object-cover" />
              ) : (
                <User size={14} />
              )}
            </div>
            <span className="min-w-0 flex-1 truncate text-left font-medium text-slate-800 dark:text-slate-100">
              {selected.full_name}
            </span>
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                select('');
              }}
              className="shrink-0 text-slate-400 hover:text-slate-600"
              aria-label="Clear"
            >
              <X size={14} />
            </span>
          </>
        ) : (
          <span className="flex-1 text-left text-slate-400">{t('customer_optional')}</span>
        )}
        <ChevronDown size={16} className="shrink-0 text-slate-400" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-1 w-full rounded-xl border-2 border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2 dark:border-slate-800">
              <Search size={14} className="shrink-0 text-slate-400" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('search_customers_placeholder')}
                className="w-full bg-transparent text-sm focus:outline-none dark:text-slate-100"
              />
            </div>
            <div className="max-h-56 overflow-y-auto py-1">
              <button
                type="button"
                onClick={() => select('')}
                className="flex w-full items-center px-3 py-2 text-left text-sm text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                {t('customer_optional')}
              </button>
              {filtered.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => select(c.id)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-light text-brand">
                    {c.photo_path ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={getCustomerPhotoPublicUrl(c.photo_path)} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <User size={16} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{c.full_name}</p>
                    <p className="truncate text-xs text-slate-400">{c.nic_number}</p>
                  </div>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="px-3 py-4 text-center text-sm text-slate-400">{t('no_customers_found')}</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
