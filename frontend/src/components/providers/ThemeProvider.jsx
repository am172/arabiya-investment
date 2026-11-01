'use client';

import { useEffect } from 'react';
import { MotionConfig } from 'framer-motion';
import { useThemeStore } from '@/store/useThemeStore';

export default function ThemeProvider({ children }) {
  const sync = useThemeStore((state) => state.sync);

  useEffect(() => {
    sync();
    const onStorage = (event) => {
      if (event.key === 'nebras-theme' && event.newValue) {
        document.documentElement.classList.toggle('dark', event.newValue === 'dark');
        sync();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [sync]);

  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}