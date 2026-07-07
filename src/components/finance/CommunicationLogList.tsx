import { getTranslator } from '@/lib/i18n/server';
import type { CommunicationLogItem } from '@/lib/queries/finance';

export async function CommunicationLogList({ items }: { items: CommunicationLogItem[] }) {
  const t = await getTranslator();

  if (items.length === 0) {
    return <p className="py-6 text-center text-sm text-slate-400">{t('no_notes_yet')}</p>;
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id} className="rounded-xl bg-slate-50 p-3">
          <p className="text-slate-800">{item.note}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
            <span>
              {new Date(item.created_at).toLocaleDateString('en-LK', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            {item.created_by_name && (
              <span>
                · {t('by_prefix')} {item.created_by_name}
              </span>
            )}
            {item.customer_name && <span className="rounded-full bg-brand-light px-2 py-0.5 text-brand-dark">{item.customer_name}</span>}
            {item.vehicle_label && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700">{item.vehicle_label}</span>}
          </div>
        </li>
      ))}
    </ul>
  );
}
