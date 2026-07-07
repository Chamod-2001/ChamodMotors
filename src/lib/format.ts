export function formatLKR(amount: number): string {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// Strips everything but letters/digits and lowercases, so "CLI 9545",
// "cli-9545" and "CLI9545" all normalize to the same value. Mirrors the
// `registration_number_normalized` generated column in the vehicles table.
export function normalizePlateNumber(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}
