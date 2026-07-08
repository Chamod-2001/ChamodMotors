'use client';

import { useTransition } from 'react';
import { Check, X, Trash2 } from 'lucide-react';
import { updateReminderStatusAction, deleteReminderAction } from '@/app/calendar/actions';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function ReminderActions({
  reminderId,
  isAdmin,
  revalidatePaths,
}: {
  reminderId: string;
  isAdmin: boolean;
  revalidatePaths: string[];
}) {
  const [isPending, startTransition] = useTransition();
  const { t } = useLanguage();

  function markDone() {
    startTransition(() => {
      updateReminderStatusAction(reminderId, 'done', revalidatePaths);
    });
  }

  function dismiss() {
    startTransition(() => {
      updateReminderStatusAction(reminderId, 'dismissed', revalidatePaths);
    });
  }

  function handleDelete() {
    if (!confirm(t('reminder_delete_confirm'))) return;
    startTransition(() => {
      deleteReminderAction(reminderId, revalidatePaths);
    });
  }

  return (
    <div className="flex shrink-0 items-center gap-1">
      <button
        type="button"
        onClick={markDone}
        disabled={isPending}
        aria-label={t('mark_done')}
        title={t('mark_done')}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-green-600 hover:bg-green-50 disabled:opacity-50 dark:hover:bg-green-950"
      >
        <Check size={16} />
      </button>
      <button
        type="button"
        onClick={dismiss}
        disabled={isPending}
        aria-label={t('dismiss')}
        title={t('dismiss')}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-800"
      >
        <X size={16} />
      </button>
      {isAdmin && (
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          aria-label={t('delete')}
          title={t('delete')}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-950"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
}
