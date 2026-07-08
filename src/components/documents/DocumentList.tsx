import { FileText, Zap, Paperclip, ExternalLink } from 'lucide-react';
import { getTranslator } from '@/lib/i18n/server';
import { DeleteDocumentButton } from '@/components/documents/DeleteDocumentButton';
import type { DocumentItem } from '@/lib/queries/documents';
import type { DocumentType } from '../../../types/database.types';
import type { TranslationKey } from '@/lib/i18n/translations';

const DOC_TYPE_ICON: Record<DocumentType, typeof FileText> = {
  nic: FileText,
  electricity_bill: Zap,
  shop_letter: FileText,
  sale_letter: FileText,
  other: Paperclip,
};

const DOC_TYPE_LABEL_KEY: Record<DocumentType, TranslationKey> = {
  nic: 'doc_type_nic',
  electricity_bill: 'doc_type_electricity_bill',
  shop_letter: 'doc_type_shop_letter',
  sale_letter: 'doc_type_sale_letter',
  other: 'doc_type_other',
};

export async function DocumentList({
  items,
  isAdmin,
  revalidatePaths,
}: {
  items: DocumentItem[];
  isAdmin: boolean;
  revalidatePaths: string[];
}) {
  const t = await getTranslator();

  if (items.length === 0) {
    return <p className="py-6 text-center text-sm text-slate-400">{t('no_documents_yet')}</p>;
  }

  return (
    <ul className="space-y-2">
      {items.map((doc) => {
        const Icon = DOC_TYPE_ICON[doc.documentType];
        return (
          <li key={doc.id} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand-dark dark:bg-brand/20 dark:text-brand">
              <Icon size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{t(DOC_TYPE_LABEL_KEY[doc.documentType])}</p>
              <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-400">
                <span>
                  {new Date(doc.createdAt).toLocaleDateString('en-LK', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
                {doc.uploadedByName && <span>· {t('by_prefix')} {doc.uploadedByName}</span>}
              </div>
            </div>
            {doc.signedUrl && (
              <a
                href={doc.signedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex shrink-0 items-center gap-1 rounded-lg border-2 border-brand-light px-2 py-1.5 text-xs font-semibold text-brand-dark hover:bg-brand-light dark:border-brand/40 dark:text-brand"
              >
                {t('view_document')} <ExternalLink size={12} />
              </a>
            )}
            {isAdmin && (
              <DeleteDocumentButton documentId={doc.id} storagePath={doc.storagePath} revalidatePaths={revalidatePaths} />
            )}
          </li>
        );
      })}
    </ul>
  );
}
