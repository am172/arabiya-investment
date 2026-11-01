'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useT } from '@/components/providers/TextsProvider';
import { useThemeStore } from '@/store/useThemeStore';

export default function ThemeToggle() {
  const t = useT();
  const mode = useThemeStore((state) => state.mode);
  const toggle = useThemeStore((state) => state.toggle);
  const dark = mode === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? t('nav_toLight') : t('nav_toDark')}
      className="relative flex items-center justify-center overflow-hidden transition border rounded-full h-11 w-11 border-border bg-surface/70 text-foreground backdrop-blur-md hover:border-foreground/30 hover:bg-foreground/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={mode}
          initial={{ y: -18, opacity: 0, rotate: -90 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 18, opacity: 0, rotate: 90 }}
          transition={{ duration: 0.22 }}
          className="absolute"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}