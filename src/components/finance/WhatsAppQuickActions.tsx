'use client';

import { useState, useTransition } from 'react';
import { contactFinanceOfficerAction, type ContactKind } from '@/app/finance/actions';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { MessageCircle, FileText, Zap, Paperclip, Loader2 } from 'lucide-react';

export function WhatsAppQuickActions({ officerId }: { officerId: string }) {
  const { t } = useLanguage();
  const [error, setError] = useState<string | undefined>();
  const [pendingKind, setPendingKind] = useState<ContactKind | null>(null);
  const [, startTransition] = useTransition();

  function handleContact(kind: ContactKind) {
    setError(undefined);
    setPendingKind(kind);
    startTransition(async () => {
      const result = await contactFinanceOfficerAction(officerId, kind);
      setPendingKind(null);
      if (result.error) setError(result.error);
      else if (result.url) window.open(result.url, '_blank', 'noopener,noreferrer');
    });
  }

  const actions: { kind: ContactKind; label: string; icon: typeof MessageCircle; tone: string }[] = [
    { kind: 'whatsapp_chat', label: t('open_chat'), icon: MessageCircle, tone: 'bg-emerald-600 text-white' },
    { kind: 'whatsapp_nic', label: t('send_nic'), icon: FileText, tone: 'bg-white border-2 border-emerald-200 text-emerald-700' },
    {
      kind: 'whatsapp_electricity_bill',
      label: t('electricity_bill'),
      icon: Zap,
      tone: 'bg-white border-2 border-emerald-200 text-emerald-700',
    },
    {
      kind: 'whatsapp_other',
      label: t('other_document'),
      icon: Paperclip,
      tone: 'bg-white border-2 border-emerald-200 text-emerald-700',
    },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        {actions.map(({ kind, label, icon: Icon, tone }) => (
          <button
            key={kind}
            type="button"
            disabled={pendingKind !== null}
            onClick={() => handleContact(kind)}
            className={`flex min-h-14 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold disabled:opacity-50 ${tone}`}
          >
            {pendingKind === kind ? <Loader2 size={18} className="animate-spin" /> : <Icon size={18} />} {label}
          </button>
        ))}
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
