'use client';

import { useState } from 'react';
import { Contact, Loader2 } from 'lucide-react';
import { normalizeLkPhone } from '@/lib/whatsapp';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import logo from '@/assets/ChamodMotors.png';
import type { ShopProfile, ShopPhoneNumber } from '../../../types/database.types';

/** vCard spec (RFC 2426) folds lines over 75 octets with CRLF + a leading
 * space — the base64 PHOTO line especially needs this for reliable import
 * on phone contact apps that are strict about line length. */
function foldLine(line: string): string {
  const CHUNK = 75;
  if (line.length <= CHUNK) return line;
  let result = line.slice(0, CHUNK);
  let rest = line.slice(CHUNK);
  while (rest.length > 0) {
    result += `\r\n ${rest.slice(0, CHUNK - 1)}`;
    rest = rest.slice(CHUNK - 1);
  }
  return result;
}

async function fetchAsBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = typeof reader.result === 'string' ? reader.result : '';
        resolve(result.split(',')[1] ?? null);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

async function buildVCard(profile: ShopProfile, phoneNumbers: ShopPhoneNumber[]): Promise<string> {
  const lines = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${profile.business_name}`, `ORG:${profile.business_name}`];

  if (profile.phone_number) {
    lines.push(`TEL;TYPE=CELL,VOICE:+${normalizeLkPhone(profile.phone_number)}`);
  }
  if (profile.whatsapp_number) {
    lines.push(`TEL;TYPE=CELL,WHATSAPP:+${normalizeLkPhone(profile.whatsapp_number)}`);
  }
  for (const p of phoneNumbers) {
    lines.push(`TEL;TYPE=WORK,VOICE:+${normalizeLkPhone(p.phone_number)}`);
  }
  if (profile.address) {
    lines.push(`ADR;TYPE=WORK:;;${profile.address.replace(/\n/g, ' ')};;;;`);
  }
  // Short by design — the full shop description belongs on the profile
  // page, not duplicated into every saved contact's notes field.
  lines.push(`NOTE:Saved from ${profile.business_name}'s digital profile`);

  const base64Logo = await fetchAsBase64(logo.src);
  if (base64Logo) {
    lines.push(`PHOTO;ENCODING=b;TYPE=PNG:${base64Logo}`);
  }

  lines.push('END:VCARD');
  return lines.map(foldLine).join('\r\n');
}

export function SaveContactButton({
  profile,
  phoneNumbers = [],
}: {
  profile: ShopProfile;
  phoneNumbers?: ShopPhoneNumber[];
}) {
  const { t } = useLanguage();
  const [isBuilding, setIsBuilding] = useState(false);

  async function handleClick() {
    setIsBuilding(true);
    try {
      const vcard = await buildVCard(profile, phoneNumbers);
      const blob = new Blob([vcard], { type: 'text/vcard' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${profile.business_name.replace(/\s+/g, '_')}.vcf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setIsBuilding(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isBuilding}
      className="flex flex-1 flex-col items-center gap-1.5 rounded-xl bg-slate-100 py-3 text-slate-700 transition hover:bg-slate-200 disabled:opacity-60 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
    >
      {isBuilding ? <Loader2 size={22} className="animate-spin" /> : <Contact size={22} />}
      <span className="text-xs font-semibold">{t('save_contact')}</span>
    </button>
  );
}
