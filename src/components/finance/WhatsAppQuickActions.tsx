'use client';

import { useState, useTransition } from 'react';
import { Select } from '@/components/ui/Select';
import { CustomerPickerDropdown } from './CustomerPickerDropdown';
import { contactFinanceOfficerAction, type DocumentKind } from '@/app/finance/actions';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { MessageCircle, FileText, Zap, Paperclip, Loader2, Send } from 'lucide-react';
import type { SimpleCustomer, SimpleVehicle } from '@/lib/queries/finance';

const DOC_OPTIONS: { value: DocumentKind; labelKey: 'doc_type_nic' | 'electricity_bill' | 'other_document'; icon: typeof FileText }[] = [
  { value: 'nic', labelKey: 'doc_type_nic', icon: FileText },
  { value: 'electricity_bill', labelKey: 'electricity_bill', icon: Zap },
  { value: 'other', labelKey: 'other_document', icon: Paperclip },
];

export function WhatsAppQuickActions({
  officerId,
  customers,
  vehicles,
}: {
  officerId: string;
  customers: SimpleCustomer[];
  vehicles: SimpleVehicle[];
}) {
  const { t } = useLanguage();
  const [error, setError] = useState<string | undefined>();
  const [selected, setSelected] = useState<DocumentKind[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [busy, setBusy] = useState<'chat' | 'documents' | null>(null);
  const [, startTransition] = useTransition();

  function toggle(value: DocumentKind) {
    setSelected((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  }

  function openUrl(url: string) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  function handleOpenChat() {
    setError(undefined);
    setBusy('chat');
    startTransition(async () => {
      const result = await contactFinanceOfficerAction(officerId, 'whatsapp_chat', undefined, customerId, vehicleId);
      setBusy(null);
      if (result.error) setError(result.error);
      else if (result.url) openUrl(result.url);
    });
  }

  function handleSendDocuments() {
    setError(undefined);
    setBusy('documents');
    startTransition(async () => {
      const result = await contactFinanceOfficerAction(officerId, 'whatsapp_documents', selected, customerId, vehicleId);
      setBusy(null);
      if (result.error) {
        setError(result.error);
      } else if (result.url) {
        openUrl(result.url);
        setSelected([]);
      }
    });
  }

  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{t('regarding_label')}</p>
      <div className="mb-4 grid grid-cols-2 gap-2">
        <CustomerPickerDropdown customers={customers} name="customer_id_display" onValueChange={setCustomerId} />
        <Select
          value={vehicleId}
          onChange={(e) => setVehicleId(e.target.value)}
          className="py-2.5! text-sm! min-h-0!"
        >
          <option value="">{t('vehicle_optional')}</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.label}
            </option>
          ))}
        </Select>
      </div>

      <button
        type="button"
        disabled={busy !== null}
        onClick={handleOpenChat}
        className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-3 text-sm font-semibold text-white disabled:opacity-50"
      >
        {busy === 'chat' ? <Loader2 size={18} className="animate-spin" /> : <MessageCircle size={18} />} {t('open_chat')}
      </button>

      <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {t('select_documents_to_send')}
      </p>
      <div className="grid grid-cols-3 gap-2">
        {DOC_OPTIONS.map(({ value, labelKey, icon: Icon }) => {
          const isSelected = selected.includes(value);
          return (
            <button
              key={value}
              type="button"
              disabled={busy !== null}
              onClick={() => toggle(value)}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl border-2 px-2 py-2 text-xs font-semibold disabled:opacity-50 ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                  : 'border-slate-200 text-slate-500 dark:border-slate-700'
              }`}
            >
              <Icon size={16} /> {t(labelKey)}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={selected.length === 0 || busy !== null}
        onClick={handleSendDocuments}
        className="mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-white border-2 border-emerald-200 px-3 py-2.5 text-sm font-semibold text-emerald-700 disabled:opacity-40"
      >
        {busy === 'documents' ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        {t('send_selected_documents')}
        {selected.length > 0 && ` (${selected.length})`}
      </button>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
