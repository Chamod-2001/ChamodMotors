import { getTranslator } from '@/lib/i18n/server';

export async function MonthPicker({ month }: { month: string }) {
  const t = await getTranslator();

  return (
    <form method="get" className="flex items-center gap-2">
      <input
        type="month"
        name="month"
        defaultValue={month}
        className="rounded-xl border-2 border-slate-200 px-4 py-3 text-base focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-light"
      />
      <button
        type="submit"
        className="rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
      >
        {t('go')}
      </button>
    </form>
  );
}
