'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { formatLocalDate } from '@/lib/calculations';
import { getHolidaysForYear } from '@/lib/holidays/sriLanka';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { ReminderItem } from '@/lib/queries/reminders';

const WEEKDAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function buildGrid(year: number, month: number): (number | null)[] {
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: (number | null)[] = Array(firstWeekday).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function MonthCalendar({
  reminders,
  selectedDate,
  onSelectDate,
}: {
  reminders: ReminderItem[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}) {
  const { t } = useLanguage();
  const today = formatLocalDate(new Date());
  const [viewYear, setViewYear] = useState(Number(today.slice(0, 4)));
  const [viewMonth, setViewMonth] = useState(Number(today.slice(5, 7)));

  const remindersByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of reminders) {
      const key = formatLocalDate(new Date(r.dueAt));
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [reminders]);

  const holidays = useMemo(() => getHolidaysForYear(viewYear), [viewYear]);
  const cells = useMemo(() => buildGrid(viewYear, viewMonth), [viewYear, viewMonth]);
  const monthLabel = new Date(viewYear, viewMonth - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  function goPrev() {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function goNext() {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous month"
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <ChevronLeft size={18} />
        </button>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{monthLabel}</p>
        <button
          type="button"
          onClick={goNext}
          aria-label="Next month"
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-slate-400">
        {WEEKDAY_LETTERS.map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />;
          const dateStr = `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDate;
          const holidayName = holidays[dateStr];
          const reminderCount = remindersByDate.get(dateStr) ?? 0;

          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelectDate(dateStr)}
              title={holidayName}
              className={clsx(
                'relative flex h-11 flex-col items-center justify-center rounded-lg text-sm transition',
                isSelected
                  ? 'bg-brand font-bold text-white'
                  : isToday
                    ? 'border-2 border-brand font-semibold text-brand'
                    : holidayName
                      ? 'bg-red-50 text-red-600'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
              )}
            >
              {day}
              {reminderCount > 0 && (
                <span
                  className={clsx('absolute bottom-1 h-1.5 w-1.5 rounded-full', isSelected ? 'bg-white' : 'bg-amber-500')}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-red-400" /> {t('holiday_label')}
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-amber-500" /> {t('reminders_label')}
        </span>
      </div>

      {holidays[selectedDate] && (
        <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-400">{holidays[selectedDate]}</p>
      )}
    </div>
  );
}
