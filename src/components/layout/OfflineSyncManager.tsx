'use client';

import { useEffect, useState } from 'react';
import { useOnlineStatus } from '@/lib/hooks/useOnlineStatus';
import { getOfflineQueue, removeFromOfflineQueue, onOfflineQueueChanged } from '@/lib/offlineQueue';
import { createReminderAction } from '@/app/calendar/actions';
import { logFinanceCommunicationAction } from '@/app/finance/actions';
import { useLanguage } from '@/lib/i18n/LanguageContext';

/**
 * Mounted once globally (in AppShell). Replays anything queued by
 * ReminderForm/CommunicationLogForm while offline as soon as the browser
 * reports connectivity again — including on first mount, in case the queue
 * has leftovers from a previous offline session that never got flushed.
 */
export function OfflineSyncManager() {
  const isOnline = useOnlineStatus();
  const { t } = useLanguage();
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const refresh = () => setPendingCount(getOfflineQueue().length);
    refresh();
    return onOfflineQueueChanged(refresh);
  }, []);

  useEffect(() => {
    if (!isOnline) return;
    const queue = getOfflineQueue();
    if (queue.length === 0) return;

    let cancelled = false;

    (async () => {
      setSyncing(true);
      for (const item of queue) {
        try {
          if (item.type === 'reminder') {
            const fd = new FormData();
            fd.set('title', item.title);
            fd.set('due_date', item.due_date);
            fd.set('due_time', item.due_time);
            fd.set('note', item.note);
            fd.set('vehicle_id', item.vehicle_id);
            fd.set('customer_id', item.customer_id);
            fd.set('finance_officer_id', item.finance_officer_id);
            await createReminderAction(fd);
          } else {
            const fd = new FormData();
            fd.set('note', item.note);
            fd.set('customer_id', item.customer_id);
            fd.set('vehicle_id', item.vehicle_id);
            await logFinanceCommunicationAction(item.officerId, fd);
          }
          removeFromOfflineQueue(item.id);
        } catch {
          // Still unreachable despite the "online" event — leave it queued,
          // the next online event or app load will retry it.
        }
      }
      if (!cancelled) setSyncing(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [isOnline]);

  if (pendingCount === 0 && !syncing) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-lg dark:bg-slate-100 dark:text-slate-900">
      {syncing ? t('syncing_label') : `${pendingCount} ${t('queued_offline_suffix')}`}
    </div>
  );
}
