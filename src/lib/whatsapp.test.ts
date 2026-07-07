import { describe, it, expect } from 'vitest';
import { normalizeLkPhone, buildWhatsAppLink } from './whatsapp';

describe('normalizeLkPhone', () => {
  it('converts a local 0-prefixed number to international format', () => {
    expect(normalizeLkPhone('0771234567')).toBe('94771234567');
  });

  it('leaves an already-international number unchanged', () => {
    expect(normalizeLkPhone('94771234567')).toBe('94771234567');
  });

  it('strips a leading + sign', () => {
    expect(normalizeLkPhone('+94771234567')).toBe('94771234567');
  });

  it('strips spaces and dashes', () => {
    expect(normalizeLkPhone('077 123 4567')).toBe('94771234567');
    expect(normalizeLkPhone('077-123-4567')).toBe('94771234567');
  });
});

describe('buildWhatsAppLink', () => {
  it('builds a wa.me link with the normalized number', () => {
    expect(buildWhatsAppLink('0771234567')).toBe('https://wa.me/94771234567');
  });

  it('appends a URL-encoded message when provided', () => {
    const link = buildWhatsAppLink('0771234567', 'Hi there, sending the NIC copy.');
    expect(link).toBe('https://wa.me/94771234567?text=Hi%20there%2C%20sending%20the%20NIC%20copy.');
  });

  it('omits the text param when no message is given', () => {
    const link = buildWhatsAppLink('0771234567');
    expect(link).not.toContain('?text=');
  });
});
