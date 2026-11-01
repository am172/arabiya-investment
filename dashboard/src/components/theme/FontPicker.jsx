import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Loader2, Search } from 'lucide-react';
import { ALL_FONTS, FONT_CATEGORIES, findFontCategory } from '../../constants/fonts';
import { isValidFontName, previewFonts, verifyFont } from '../../utils/fonts';
import { t } from '../../i18n';

const ALL = 'all';

export default function FontPicker({ label, value, onChange, sample, weight = 400, hint }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(ALL);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const rootRef = useRef(null);

  const trimmed = query.trim();
  const currentCategory = findFontCategory(value);

  const groups = useMemo(() => {
    const needle = trimmed.toLowerCase();
    return FONT_CATEGORIES.filter((group) => category === ALL || group.id === category)
      .map((group) => ({
        ...group,
        fonts: group.fonts.filter((font) => !needle || font.toLowerCase().includes(needle))
      }))
      .filter((group) => group.fonts.length > 0);
  }, [trimmed, category]);

  const isCustomCandidate =
    trimmed.length > 0 &&
    isValidFontName(trimmed) &&
    !ALL_FONTS.some((font) => font.toLowerCase() === trimmed.toLowerCase());

  useEffect(() => {
    previewFonts([value]);
  }, [value]);

  useEffect(() => {
    if (open) previewFonts(groups.flatMap((group) => group.fonts));
  }, [open, groups]);

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

  const toggle = () => {
    setOpen((current) => !current);
    setQuery('');
    setError('');
    setCategory(ALL);
  };

  const select = (name) => {
    onChange(name);
    setOpen(false);
    setQuery('');
    setError('');
  };

  const useCustom = async () => {
    setChecking(true);
    setError('');
    const result = await verifyFont(trimmed);
    setChecking(false);
    if (result === 'invalid') {
      setError(t('"{name}" was not found on Google Fonts or does not support weights 400–700.', { name: trimmed }));
      return;
    }
    select(trimmed);
  };

  const fontFamily = `'${value}', system-ui, sans-serif`;

  return (
    <div ref={rootRef} className="relative">
      <label className="label">{t(label)}</label>

      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={toggle}
        className="flex items-center justify-between gap-3 input text-start"
      >
        <span className="flex items-center min-w-0 gap-3">
          <span
            dir="ltr"
            className="text-2xl leading-none text-slate-900"
            style={{ fontFamily, fontWeight: weight }}
          >
            Aa
          </span>
          <span className="min-w-0">
            <span dir="ltr" className="block text-sm font-medium truncate text-start text-slate-800">
              {value}
            </span>
            <span className="block text-xs truncate text-slate-500">
              {currentCategory ? t(currentCategory.label) : t('Custom Google Font')}
            </span>
          </span>
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-slate-400 transition ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {sample && (
        <p className="mt-2 text-sm truncate text-slate-500" style={{ fontFamily, fontWeight: weight }}>
          {t(sample)}
        </p>
      )}
      {hint && <p className="hint">{t(hint)}</p>}

      {open && (
        <div className="absolute inset-x-0 z-30 mt-2 min-w-[18rem] overflow-hidden rounded-2xl border border-slate-200 bg-card shadow-xl">
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search size={16} className="absolute -translate-y-1/2 start-3 top-1/2 text-slate-400" />
              <input
                autoFocus
                className="input ps-9"
                placeholder={t('Search or type any Google Font')}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setError('');
                }}
              />
            </div>
            <div className="-mx-1 mt-3 flex gap-1.5 overflow-x-auto px-1 pb-1">
              {[{ id: ALL, label: 'All' }, ...FONT_CATEGORIES].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={category === item.id}
                  onClick={() => setCategory(item.id)}
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition ${
                    category === item.id
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t(item.label)}
                </button>
              ))}
            </div>
          </div>

          <ul role="listbox" aria-label={t(label)} className="p-2 overflow-y-auto max-h-72">
            {isCustomCandidate && (
              <li className="mb-2">
                <button
                  type="button"
                  disabled={checking}
                  onClick={useCustom}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-dashed border-brand-300 bg-brand-50 px-3 py-2.5 text-start text-sm font-medium text-brand-700 transition hover:bg-brand-100 disabled:opacity-70"
                >
                  <span className="truncate">{t('Use “{name}” from Google Fonts', { name: trimmed })}</span>
                  {checking && <Loader2 size={16} className="shrink-0 animate-spin" />}
                </button>
                {error && <p className="px-1 error-text">{error}</p>}
              </li>
            )}

            {groups.length === 0 && !isCustomCandidate && (
              <li className="px-3 py-8 text-sm text-center text-slate-400">{t('No fonts match')}</li>
            )}

            {groups.map((group) => (
              <li key={group.id} className="mb-2 last:mb-0">
                <p className="px-3 pb-1 pt-2 text-[11px] font-semibold text-slate-400">{t(group.label)}</p>
                <ul>
                  {group.fonts.map((font) => {
                    const selected = font.toLowerCase() === String(value).toLowerCase();
                    return (
                      <li key={font}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={selected}
                          onClick={() => select(font)}
                          className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-start transition ${
                            selected ? 'bg-brand-50 text-brand-700' : 'hover:bg-slate-50'
                          }`}
                        >
                          <span
                            dir="ltr"
                            className="text-lg truncate text-slate-900"
                            style={{ fontFamily: `'${font}', system-ui, sans-serif` }}
                          >
                            {font}
                          </span>
                          {selected && <Check size={16} className="shrink-0 text-brand-600" />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}