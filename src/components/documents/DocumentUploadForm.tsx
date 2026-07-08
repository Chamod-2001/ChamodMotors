'use client';

import { useRef, useState, useTransition } from 'react';
import { Camera, ImagePlus, Loader2 } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { uploadDocumentFile } from '@/lib/uploadDocument';
import { uploadDocumentAction } from '@/app/documents/actions';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { DocumentType } from '../../../types/database.types';

const DOC_TYPE_OPTIONS: { value: DocumentType; labelKey: 'doc_type_nic' | 'doc_type_electricity_bill' | 'doc_type_shop_letter' | 'doc_type_sale_letter' | 'doc_type_other' }[] = [
  { value: 'nic', labelKey: 'doc_type_nic' },
  { value: 'electricity_bill', labelKey: 'doc_type_electricity_bill' },
  { value: 'shop_letter', labelKey: 'doc_type_shop_letter' },
  { value: 'sale_letter', labelKey: 'doc_type_sale_letter' },
  { value: 'other', labelKey: 'doc_type_other' },
];

export function DocumentUploadForm({
  customerId,
  vehicleId,
  vehicleOptions,
  revalidatePaths,
}: {
  customerId?: string;
  vehicleId?: string;
  /** Lets the uploader tag which of the customer's purchased vehicles this document belongs to. */
  vehicleOptions?: { id: string; label: string }[];
  revalidatePaths: string[];
}) {
  const { t } = useLanguage();
  const [documentType, setDocumentType] = useState<DocumentType>('nic');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    setError(undefined);
    setIsUploading(true);
    try {
      const storagePath = await uploadDocumentFile(file);
      const taggedVehicleId = vehicleId ?? (selectedVehicleId || undefined);
      const paths = [...revalidatePaths, ...(selectedVehicleId ? [`/vehicles/${selectedVehicleId}`] : [])];
      startTransition(async () => {
        const result = await uploadDocumentAction({
          storagePath,
          documentType,
          vehicleId: taggedVehicleId,
          customerId,
          revalidatePaths: paths,
        });
        if (result?.error) setError(result.error);
      });
    } catch {
      setError(t('document_upload_failed'));
    } finally {
      setIsUploading(false);
    }
  }

  const busy = isUploading || isPending;

  return (
    <div className="space-y-3">
      <Select
        value={documentType}
        onChange={(e) => setDocumentType(e.target.value as DocumentType)}
        className="!py-3 !text-sm !min-h-0"
      >
        {DOC_TYPE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {t(opt.labelKey)}
          </option>
        ))}
      </Select>

      {vehicleOptions && vehicleOptions.length > 0 && (
        <Select
          value={selectedVehicleId}
          onChange={(e) => setSelectedVehicleId(e.target.value)}
          className="!py-3 !text-sm !min-h-0"
        >
          <option value="">{t('vehicle_optional')}</option>
          {vehicleOptions.map((v) => (
            <option key={v.id} value={v.id}>
              {v.label}
            </option>
          ))}
        </Select>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => cameraInputRef.current?.click()}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 py-3 text-sm font-medium text-slate-500 hover:border-brand-dark hover:text-brand disabled:opacity-50 dark:border-slate-700"
        >
          {busy ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
          {t('camera')}
        </button>
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handleFile(e.target.files)}
        />

        <button
          type="button"
          disabled={busy}
          onClick={() => galleryInputRef.current?.click()}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 py-3 text-sm font-medium text-slate-500 hover:border-brand-dark hover:text-brand disabled:opacity-50 dark:border-slate-700"
        >
          {busy ? <Loader2 size={18} className="animate-spin" /> : <ImagePlus size={18} />}
          {t('gallery')}
        </button>
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(e) => handleFile(e.target.files)}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
