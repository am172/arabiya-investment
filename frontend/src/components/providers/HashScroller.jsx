'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { isAligned, scrollToHash } from '@/lib/scroll';

const DELAYS = [0, 80, 200, 400, 700, 1100, 1600, 2400];
const CANCEL_EVENTS = ['wheel', 'touchstart', 'keydown', 'mousedown'];

export default function HashScroller() {
  const pathname = usePathname();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return undefined;

    const timers = DELAYS.map((delay) =>
      setTimeout(() => {
        if (!isAligned(hash)) scrollToHash(hash);
      }, delay)
    );

    const cancel = () => timers.forEach(clearTimeout);
    CANCEL_EVENTS.forEach((name) =>
      window.addEventListener(name, cancel, { passive: true, once: true })
    );

    return () => {
      cancel();
      CANCEL_EVENTS.forEach((name) => window.removeEventListener(name, cancel));
    };
  }, [pathname]);

  return null;
}