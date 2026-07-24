'use client';

import { useEffect } from 'react';

/** Sets the OS-level badge count on the app icon (Android/desktop Chrome,
 * and iOS Safari 16.4+ once "Add to Home Screen" is used) — same idea as
 * WhatsApp's icon badge, so pending items are visible without opening the
 * app. No-op where the Badging API isn't supported. */
export function NotificationBadgeSync({ count }: { count: number }) {
  useEffect(() => {
    if (!('setAppBadge' in navigator)) return;
    if (count > 0) {
      navigator.setAppBadge(count).catch(() => {});
    } else {
      navigator.clearAppBadge().catch(() => {});
    }
  }, [count]);

  return null;
}
