'use client';

import { useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { deleteDocumentAction } from '@/app/documents/actions';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function DeleteDocumentButton({
  documentId,
  storagePath,
  revalidatePaths,
}: {
  documentId: string;
  storagePath: string;
  revalidatePaths: string[];
}) {
  const [isPending, startTransition] = useTransition();
  const { t } = useLanguage();

  function handleDelete() {
    if (!confirm(t('document_delete_confirm'))) return;
    startTransition(() => {
      deleteDocumentAction(documentId, storagePath, revalidatePaths);
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      aria-label={t('delete')}
      className="shrink-0 rounded-lg p-1.5 text-red-500 hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-950"
    >
      <Trash2 size={16} />
    </button>
  );
}
