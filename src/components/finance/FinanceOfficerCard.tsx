'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import type { FinanceOfficerRow } from '@/lib/queries/finance';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import { MessageCircle, Phone, User } from 'lucide-react';

export function FinanceOfficerCard({ officer }: { officer: FinanceOfficerRow }) {
  return (
    <Card className="flex items-center gap-3">
      <Link href={`/finance/${officer.id}`} className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <User size={20} />
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-900">{officer.officer_name}</p>
          <p className="truncate text-sm text-slate-500">{officer.phone_number ?? officer.whatsapp_number ?? '—'}</p>
        </div>
      </Link>
      <div className="ml-auto flex shrink-0 items-center gap-3 pl-4 pr-1">
        {officer.phone_number && (
          <a
            href={`tel:${officer.phone_number}`}
            onClick={(e) => e.stopPropagation()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
            aria-label="Call"
          >
            <Phone size={20} />
          </a>
        )}
        {(officer.whatsapp_number || officer.phone_number) && (
          <a
            href={buildWhatsAppLink(officer.whatsapp_number || officer.phone_number || '')}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
            aria-label="Open WhatsApp"
          >
            <MessageCircle size={20} />
          </a>
        )}
      </div>
    </Card>
  );
}
