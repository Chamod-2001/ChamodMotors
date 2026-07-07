import { describe, it, expect } from 'vitest';
import {
  calculateGrossProfit,
  sumGrossProfit,
  sumRevenue,
  currentMonthValue,
  monthToRange,
  todayRange,
} from './calculations';

describe('calculateGrossProfit', () => {
  it('computes selling price minus buying price', () => {
    expect(calculateGrossProfit(500000, 400000)).toBe(100000);
  });

  it('returns a negative number when sold at a loss', () => {
    expect(calculateGrossProfit(350000, 400000)).toBe(-50000);
  });

  it('returns zero when sold at cost', () => {
    expect(calculateGrossProfit(400000, 400000)).toBe(0);
  });

  it('coerces numeric strings (as Postgres numeric columns can arrive as strings)', () => {
    // @ts-expect-error - intentionally passing string-typed numerics
    expect(calculateGrossProfit('500000', '400000')).toBe(100000);
  });
});

describe('sumGrossProfit', () => {
  it('sums profit across multiple sales', () => {
    const total = sumGrossProfit([
      { salePrice: 500000, buyingPrice: 400000 }, // 100,000
      { salePrice: 300000, buyingPrice: 320000 }, // -20,000
      { salePrice: 250000, buyingPrice: 200000 }, // 50,000
    ]);
    expect(total).toBe(130000);
  });

  it('returns 0 for an empty list', () => {
    expect(sumGrossProfit([])).toBe(0);
  });
});

describe('sumRevenue', () => {
  it('sums sale prices', () => {
    expect(sumRevenue([{ salePrice: 100 }, { salePrice: 200 }, { salePrice: 300 }])).toBe(600);
  });

  it('returns 0 for an empty list', () => {
    expect(sumRevenue([])).toBe(0);
  });
});

describe('currentMonthValue', () => {
  it('formats as YYYY-MM with zero-padded month', () => {
    expect(currentMonthValue(new Date(2026, 0, 15))).toBe('2026-01'); // January
    expect(currentMonthValue(new Date(2026, 10, 1))).toBe('2026-11'); // November
  });
});

describe('monthToRange', () => {
  it('returns the first day of the month as start', () => {
    const { start } = monthToRange('2026-07');
    expect(start).toBe('2026-07-01');
  });

  it('returns the first day of the NEXT month as the exclusive end', () => {
    const { end } = monthToRange('2026-07');
    expect(end).toBe('2026-08-01');
  });

  it('rolls over correctly for December', () => {
    const { start, end } = monthToRange('2026-12');
    expect(start).toBe('2026-12-01');
    expect(end).toBe('2027-01-01');
  });

  it('throws on a malformed month string', () => {
    expect(() => monthToRange('not-a-month')).toThrow();
    expect(() => monthToRange('2026-13')).toThrow();
  });
});

describe('todayRange', () => {
  it('spans exactly one day, start to next-day exclusive end', () => {
    const { start, end } = todayRange(new Date(2026, 6, 7)); // July 7, 2026
    expect(start).toBe('2026-07-07');
    expect(end).toBe('2026-07-08');
  });
});
