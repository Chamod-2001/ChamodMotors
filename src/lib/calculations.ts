/**
 * Pure calculation helpers used across Dashboard and Reports.
 * Kept free of I/O so they can be unit tested directly.
 */

/** Gross profit = selling price − buying price (mirrors the DB generated column). */
export function calculateGrossProfit(sellingPrice: number, buyingPrice: number): number {
  return Number(sellingPrice) - Number(buyingPrice);
}

/** Sums gross profit across a list of {sale_price, buying_price} pairs. */
export function sumGrossProfit(sales: { salePrice: number; buyingPrice: number }[]): number {
  return sales.reduce((sum, s) => sum + calculateGrossProfit(s.salePrice, s.buyingPrice), 0);
}

/** Sums revenue (sale_price) across a list of sales. */
export function sumRevenue(sales: { salePrice: number }[]): number {
  return sales.reduce((sum, s) => sum + Number(s.salePrice), 0);
}

/** Current month as "YYYY-MM", used to default report/month pickers. */
export function currentMonthValue(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/** Formats a Date as "YYYY-MM-DD" using its local calendar date (no UTC conversion). */
function formatLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Converts a "YYYY-MM" value into a [start, end) date range (end exclusive), as "YYYY-MM-DD" strings. */
export function monthToRange(month: string): { start: string; end: string } {
  const [year, mon] = month.split('-').map(Number);
  if (!year || !mon || mon < 1 || mon > 12) {
    throw new Error(`Invalid month value: "${month}". Expected format "YYYY-MM".`);
  }
  // Using local-date components throughout (not toISOString, which converts
  // to UTC and rolls the date back by one in any timezone ahead of UTC —
  // e.g. Sri Lanka, UTC+5:30 — silently shifting "today"/month boundaries).
  const start = new Date(year, mon - 1, 1);
  const end = new Date(year, mon, 1);
  return { start: formatLocalDate(start), end: formatLocalDate(end) };
}

/** Today as a [start, end) date range (end exclusive), as "YYYY-MM-DD" strings. */
export function todayRange(date = new Date()): { start: string; end: string } {
  const start = formatLocalDate(date);
  const end = formatLocalDate(new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1));
  return { start, end };
}
