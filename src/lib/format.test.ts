import { describe, it, expect } from 'vitest';
import { formatLKR } from './format';

describe('formatLKR', () => {
  it('formats a whole number as LKR currency', () => {
    const result = formatLKR(500000);
    expect(result).toContain('500,000');
    expect(result).toMatch(/LKR|Rs/); // Intl may render the symbol as "LKR" or "Rs"
  });

  it('rounds to whole rupees (no decimal places)', () => {
    const result = formatLKR(1234.56);
    expect(result).not.toContain('.56');
  });

  it('formats zero correctly', () => {
    const result = formatLKR(0);
    expect(result).toContain('0');
  });

  it('handles negative amounts (e.g. a loss on a sale)', () => {
    const result = formatLKR(-50000);
    expect(result).toContain('50,000');
    expect(result).toMatch(/-/);
  });
});
