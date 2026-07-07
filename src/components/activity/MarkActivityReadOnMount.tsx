'use client';

import { useEffect } from 'react';
import { markActivityReadAction } from '@/app/activity/actions';

// Clears the admin's unread activity badge once they've actually viewed the log.
export function MarkActivityReadOnMount() {
  useEffect(() => {
    markActivityReadAction();
  }, []);

  return null;
}
