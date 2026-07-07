'use client';

import { Contact } from 'lucide-react';
import { normalizeLkPhone } from '@/lib/whatsapp';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { ShopProfile } from '../../../types/database.types';

function buildVCard(profile: ShopProfile): string {
  const lines = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${profile.business_name}`, `ORG:${profile.business_name}`];
  if (profile.phone_number) {
    lines.push(`TEL;TYPE=CELL,VOICE:+${normalizeLkPhone(profile.phone_number)}`);
  }
  if (profile.whatsapp_number) {
    lines.push(`TEL;TYPE=CELL,WHATSAPP:+${normalizeLkPhone(profile.whatsapp_number)}`);
  }
  if (profile.address) {
    lines.push(`ADR;TYPE=WORK:;;${profile.address.replace(/\n/g, ' ')};;;;`);
  }
  if (profile.description) {
    lines.push(`NOTE:${profile.description.replace(/\n/g, ' ')}`);
  }
  lines.push('END:VCARD');
  return lines.join('\r\n');
}

export function SaveContactButton({ profile }: { profile: ShopProfile }) {
  const { t } = useLanguage();

  function handleClick() {
    const vcard = buildVCard(profile);
    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${profile.business_name.replace(/\s+/g, '_')}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex flex-1 flex-col items-center gap-1.5 rounded-xl bg-slate-100 py-3 text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
    >
      <Contact size={22} />
      <span className="text-xs font-semibold">{t('save_contact')}</span>
    </button>
  );
}
