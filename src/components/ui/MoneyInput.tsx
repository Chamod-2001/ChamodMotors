'use client';

import { useId, useRef, useState, type ChangeEvent } from 'react';
import { clsx } from 'clsx';

function formatWithCommas(raw: string): string {
  if (!raw) return '';
  const [intPart, decPart] = raw.split('.');
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return decPart !== undefined ? `${withCommas}.${decPart}` : withCommas;
}

/** Keeps digits and a single decimal point — everything else (commas the
 * user typed, letters, extra dots) is dropped. */
function stripToRawNumber(display: string): string {
  const cleaned = display.replace(/[^\d.]/g, '');
  const firstDot = cleaned.indexOf('.');
  if (firstDot === -1) return cleaned;
  return cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, '');
}

function countDigits(value: string): number {
  return (value.match(/\d/g) ?? []).length;
}

interface MoneyInputProps {
  name: string;
  label?: string;
  required?: boolean;
  defaultValue?: string | number;
  /** Controlled mode — pass the raw (comma-free) numeric string, e.g. when a
   * parent needs the live value (a running total, a profit preview, etc). */
  value?: string;
  onValueChange?: (raw: string) => void;
}

/** A plain `<input type="number">` can't show thousand separators while
 * typing. This renders a comma-formatted text field for readability, backed
 * by a hidden input carrying the plain numeric value under `name` — so the
 * surrounding <form> and every server action keep reading a clean number,
 * completely unaware this field is comma-formatted on screen. */
export function MoneyInput({ name, label, required, defaultValue, value, onValueChange }: MoneyInputProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const isControlled = value !== undefined;
  const [internalRaw, setInternalRaw] = useState(defaultValue != null ? String(defaultValue) : '');
  const raw = isControlled ? value : internalRaw;

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const cursorPos = input.selectionStart ?? input.value.length;
    const digitsBeforeCursor = countDigits(input.value.slice(0, cursorPos));
    const nextRaw = stripToRawNumber(input.value);

    if (!isControlled) setInternalRaw(nextRaw);
    onValueChange?.(nextRaw);

    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (!el) return;
      const nextDisplay = formatWithCommas(nextRaw);
      let seen = 0;
      let pos = nextDisplay.length;
      if (digitsBeforeCursor === 0) {
        pos = 0;
      } else {
        for (let i = 0; i < nextDisplay.length; i++) {
          if (/\d/.test(nextDisplay[i])) seen++;
          if (seen === digitsBeforeCursor) {
            pos = i + 1;
            break;
          }
        }
      }
      el.setSelectionRange(pos, pos);
    });
  }

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-2 block text-base font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <input
        ref={inputRef}
        id={id}
        type="text"
        inputMode="decimal"
        value={formatWithCommas(raw)}
        onChange={handleChange}
        required={required}
        className={clsx(
          'w-full rounded-xl border-2 border-slate-200 px-4 py-4 text-lg text-slate-900',
          'dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100',
          'focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-light',
          'min-h-[56px]'
        )}
      />
      <input type="hidden" name={name} value={raw} />
    </div>
  );
}
