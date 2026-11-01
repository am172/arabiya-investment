import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { ICON_OPTIONS, findIcon, getIcon } from '../../constants/icons';
import { t } from '../../i18n';

export default function IconPicker({ label, value, onChange, error }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const Current = getIcon(value);
  const known = findIcon(value);

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      {label && <label className="label">{t(label)}</label>}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={`input flex items-center justify-between gap-3 text-start ${error ? 'input-error' : ''}`}
      >
        <span className="flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-50 text-brand-600">
            <Current size={18} />
          </span>
          <span className="text-sm text-slate-700">{known ? t(known.label) : t('Custom icon')}</span>
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-slate-400 transition ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute start-0 z-30 mt-2 w-72 max-w-[calc(100vw-3rem)] rounded-2xl border border-slate-200 bg-card p-3 shadow-xl">
          <ul
            role="listbox"
            aria-label={t('Icons')}
            className="grid max-h-60 grid-cols-6 gap-1.5 overflow-y-auto"
          >
            {ICON_OPTIONS.map((option) => {
              const Icon = option.component;
              const selected = option.name === value;
              return (
                <li key={option.name}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    title={t(option.label)}
                    onClick={() => {
                      onChange(option.name);
                      setOpen(false);
                    }}
                    className={`flex h-10 w-full items-center justify-center rounded-lg transition ${
                      selected
                        ? 'bg-brand-600 text-white'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon size={18} />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {error && <p className="error-text">{t(error)}</p>}
    </div>
  );
}