'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useT } from '@/components/providers/TextsProvider';

export default function Modal({ open, onClose, label, children }) {
  const t = useT();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    const previous = document.body.style.overflow;
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={label}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4 sm:p-8"
        >
          <button
            type="button"
            aria-label={t('common_closeDialog')}
            onClick={onClose}
            className="absolute inset-0 h-full w-full cursor-default bg-black/75 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            className="relative z-10 w-full max-w-4xl"
          >
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                aria-label={t('common_close')}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/25"
              >
                <X size={20} />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}