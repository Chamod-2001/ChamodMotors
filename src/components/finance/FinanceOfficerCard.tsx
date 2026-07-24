'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { getFinancePhotoPublicUrl } from '@/lib/storageUrls';
import { contactFinanceOfficerAction } from '@/app/finance/actions';
import type { FinanceOfficerRow } from '@/lib/queries/finance';
import { MessageCircle, Phone, User, Loader2 } from 'lucide-react';

/** `officer.phone_number`/`whatsapp_number` are redacted to null by the
 * server page before this ever reaches a non-admin viewer's browser — see
 * finance/page.tsx. `hasContact`/`hasPhone` still tell this card whether to
 * show the WhatsApp/Call buttons even when the raw numbers aren't present
 * in props (per-employee request: employees get a working Call button, they
 * just never see the number as text). */
export function FinanceOfficerCard({
  officer,
  isAdmin,
  hasContact,
  hasPhone,
}: {
  officer: FinanceOfficerRow;
  isAdmin: boolean;
  hasContact: boolean;
  hasPhone: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] = useState<'call' | 'whatsapp' | null>(null);

  function handleWhatsApp(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setPendingAction('whatsapp');
    startTransition(async () => {
      const result = await contactFinanceOfficerAction(officer.id, 'whatsapp_chat');
      setPendingAction(null);
      if (result.url) window.open(result.url, '_blank', 'noopener,noreferrer');
    });
  }

  function handleCall(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setPendingAction('call');
    startTransition(async () => {
      const result = await contactFinanceOfficerAction(officer.id, 'call');
      setPendingAction(null);
      if (result.url) window.location.href = result.url;
    });
  }

  return (
    <Card className="flex items-center gap-3">
      <Link href={`/finance/${officer.id}`} className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800">
          {officer.photo_path ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={getFinancePhotoPublicUrl(officer.photo_path)} alt="" className="h-full w-full object-cover" />
          ) : (
            <User size={20} />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-900">{officer.officer_name}</p>
          {isAdmin && (
            <p className="truncate text-sm text-slate-500">{officer.phone_number ?? officer.whatsapp_number ?? '—'}</p>
          )}
        </div>
      </Link>
      <div className="ml-auto flex shrink-0 items-center gap-3 pl-4 pr-1">
        {hasPhone && (
          <button
            onClick={handleCall}
            disabled={isPending}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-blue-600 hover:bg-blue-50 disabled:opacity-50 dark:hover:bg-blue-950"
            aria-label="Call"
          >
            {pendingAction === 'call' ? <Loader2 size={20} className="animate-spin" /> : <Phone size={20} />}
          </button>
        )}
        {hasContact && (
          <button
            onClick={handleWhatsApp}
            disabled={isPending}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 disabled:opacity-50"
            aria-label="Open WhatsApp"
          >
            {pendingAction === 'whatsapp' ? <Loader2 size={20} className="animate-spin" /> : <MessageCircle size={20} />}
          </button>
        )}
      </div>
    </Card>
  );
}
