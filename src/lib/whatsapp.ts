/**
 * Normalizes a Sri Lankan phone number into international format (no +),
 * e.g. "0771234567" -> "94771234567", "+94771234567" -> "94771234567".
 */
export function normalizeLkPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('94')) return digits;
  if (digits.startsWith('0')) return `94${digits.slice(1)}`;
  return digits;
}

export function buildWhatsAppLink(phone: string, message?: string): string {
  const number = normalizeLkPhone(phone);
  const base = `https://wa.me/${number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
