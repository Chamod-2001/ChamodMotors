'use client';

import { useState } from 'react';
import { Camera, Check, Loader2 } from 'lucide-react';
import { uploadDocumentFile } from '@/lib/uploadDocument';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { DocumentType } from '../../../types/database.types';

interface PickedDoc {
  documentType: DocumentType;
  storagePath: string;
}

/** Compact 3-slot uploader (photo / NIC / letter) for the person on one side
 * of a vehicle transaction — the seller at intake, or the buyer at sale.
 * Files upload to storage immediately; the resulting paths ride along as
 * hidden `${namePrefix}DocTypes` / `${namePrefix}DocPaths` fields so the
 * surrounding <form> can link them to the vehicle/sale once it's saved. */
export function PartyDocumentPicker({
  namePrefix,
  title,
  letterDocumentType,
  letterLabel,
}: {
  namePrefix: 'seller' | 'buyer';
  title: string;
  letterDocumentType: DocumentType;
  letterLabel: string;
}) {
  const { t } = useLanguage();
  const [docs, setDocs] = useState<Record<string, PickedDoc>>({});
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);
  const [error, setError] = useState<string | undefined>();

  const slots: { key: string; documentType: DocumentType; label: string }[] = [
    { key: 'photo', documentType: 'photo', label: t('party_doc_photo') },
    { key: 'nic', documentType: 'nic', label: t('party_doc_nic') },
    { key: 'letter', documentType: letterDocumentType, label: letterLabel },
  ];

  async function handlePick(slotKey: string, documentType: DocumentType, file: File | undefined) {
    if (!file) return;
    setError(undefined);
    setUploadingSlot(slotKey);
    try {
      const storagePath = await uploadDocumentFile(file);
      setDocs((prev) => ({ ...prev, [slotKey]: { documentType, storagePath } }));
    } catch {
      setError(t('document_upload_failed'));
    } finally {
      setUploadingSlot(null);
    }
  }

  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">{title}</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {slots.map((slot) => {
          const picked = docs[slot.key];
          const isUploading = uploadingSlot === slot.key;
          return (
            <label
              key={slot.key}
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed px-3 py-3 text-sm font-medium transition ${
                picked
                  ? 'border-green-400 bg-green-50 text-green-700 dark:border-green-600 dark:bg-green-950/30 dark:text-green-400'
                  : 'border-slate-300 text-slate-500 hover:border-brand-dark hover:text-brand dark:border-slate-700'
              }`}
            >
              {isUploading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : picked ? (
                <Check size={16} />
              ) : (
                <Camera size={16} />
              )}
              <span className="truncate">{slot.label}</span>
              <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                disabled={isUploading}
                onChange={(e) => handlePick(slot.key, slot.documentType, e.target.files?.[0])}
              />
            </label>
          );
        })}
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {Object.values(docs).map((doc) => (
        <span key={doc.storagePath}>
          <input type="hidden" name={`${namePrefix}DocTypes`} value={doc.documentType} />
          <input type="hidden" name={`${namePrefix}DocPaths`} value={doc.storagePath} />
        </span>
      ))}
    </div>
  );
}
