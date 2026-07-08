'use client';

import { buildWhatsAppLink } from '@/lib/whatsapp';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { MessageCircle, FileText, Zap, Paperclip } from 'lucide-react';

interface WhatsAppQuickActionsProps {
  phone: string;
  officerName: string;
  businessName: string;
}

function buildDocumentMessage(officerName: string, documentLabel: string, businessName: string) {
  return `Hi ${officerName},\n\nසුභ දවසක්!\n\n${documentLabel} එක attach කර ඇත. කරුණාකර එය check කරලා update එකක් ලබා දෙන්න.\n\nThank you.\n\n${businessName}`;
}

export function WhatsAppQuickActions({ phone, officerName, businessName }: WhatsAppQuickActionsProps) {
  const { t } = useLanguage();

  const actions = [
    { label: t('open_chat'), icon: MessageCircle, message: undefined, tone: 'bg-emerald-600 text-white' },
    {
      label: t('send_nic'),
      icon: FileText,
      message: buildDocumentMessage(officerName, 'NIC copy', businessName),
      tone: 'bg-white border-2 border-emerald-200 text-emerald-700',
    },
    {
      label: t('electricity_bill'),
      icon: Zap,
      message: buildDocumentMessage(officerName, 'Electricity bill', businessName),
      tone: 'bg-white border-2 border-emerald-200 text-emerald-700',
    },
    {
      label: t('other_document'),
      icon: Paperclip,
      message: buildDocumentMessage(officerName, 'Document', businessName),
      tone: 'bg-white border-2 border-emerald-200 text-emerald-700',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {actions.map(({ label, icon: Icon, message, tone }) => (
        <a
          key={label}
          href={buildWhatsAppLink(phone, message)}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex min-h-[56px] items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold ${tone}`}
        >
          <Icon size={18} /> {label}
        </a>
      ))}
    </div>
  );
}
