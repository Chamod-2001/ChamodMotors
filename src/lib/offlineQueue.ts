/**
 * Tiny offline queue for the two actions worth saving locally when there's no
 * connection: adding a reminder, and logging a finance communication note.
 * Both are plain text/ids (no files), so localStorage is enough — no need
 * for IndexedDB. Deliberately NOT used for vehicle/customer/document actions,
 * since those risk silently overwriting someone else's concurrent change.
 */
const STORAGE_KEY = 'mdms-offline-queue';
const QUEUE_CHANGED_EVENT = 'mdms-offline-queue-changed';

export interface QueuedReminder {
  id: string;
  type: 'reminder';
  createdAt: string;
  title: string;
  due_date: string;
  due_time: string;
  note: string;
  vehicle_id: string;
  customer_id: string;
  finance_officer_id: string;
}

export interface QueuedFinanceNote {
  id: string;
  type: 'finance_note';
  createdAt: string;
  officerId: string;
  note: string;
  customer_id: string;
  vehicle_id: string;
}

export type QueuedAction = QueuedReminder | QueuedFinanceNote;

function readQueue(): QueuedAction[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeQueue(queue: QueuedAction[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  window.dispatchEvent(new Event(QUEUE_CHANGED_EVENT));
}

export function enqueueOfflineAction(action: Omit<QueuedReminder, 'id' | 'createdAt'> | Omit<QueuedFinanceNote, 'id' | 'createdAt'>) {
  const queue = readQueue();
  queue.push({ ...action, id: crypto.randomUUID(), createdAt: new Date().toISOString() } as QueuedAction);
  writeQueue(queue);
}

export function getOfflineQueue(): QueuedAction[] {
  return readQueue();
}

export function removeFromOfflineQueue(id: string) {
  writeQueue(readQueue().filter((a) => a.id !== id));
}

export function onOfflineQueueChanged(callback: () => void): () => void {
  window.addEventListener(QUEUE_CHANGED_EVENT, callback);
  return () => window.removeEventListener(QUEUE_CHANGED_EVENT, callback);
}
