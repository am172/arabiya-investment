import { useEffect } from 'react';
import { X } from 'lucide-react';
import { t } from '../../i18n';

const SIZES = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl' };

export default function Modal({ open, onClose, title, size = 'md', children }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape' && onClose) onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60" onClick={onClose} />
      <div
        className={`relative max-h-[90vh] w-full overflow-y-auto rounded-2xl border border-slate-200 bg-card p-6 shadow-xl ${SIZES[size]}`}
      >
        {title && (
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-slate-900">{t(title)}</h3>
            <button type="button" className="icon-btn" aria-label={t('Close')} onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}