'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Coins } from 'lucide-react';
import { useCurrency } from '@/components/providers/CurrencyProvider';
import { useT } from '@/components/providers/TextsProvider';

export default function CurrencySwitcher() {
    const t = useT();
    const { ready, currencies, current, setCurrency, attribution } = useCurrency();
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);

    const names = useMemo(() => {
        try {
            return new Intl.DisplayNames(['ar'], { type: 'currency' });
        } catch (error) {
            return null;
        }
    }, []);

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

    if (!ready || currencies.length < 2) return null;

    const label = (code) => {
        try {
            return names ? names.of(code) : code;
        } catch (error) {
            return code;
        }
    };

    return (
        <div ref={rootRef} className="relative">
            <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label={t('currency_choose')}
                onClick={() => setOpen((value) => !value)}
                className="flex h-11 items-center gap-1.5 rounded-full border border-border bg-surface/70 px-3 text-sm font-semibold text-foreground backdrop-blur-md transition hover:border-foreground/30 hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
            >
                <Coins size={16} className="hidden sm:block" />
                <span dir="ltr">{current}</span>
                <ChevronDown size={14} className={`transition ${open ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50 mt-2 overflow-hidden border shadow-xl end-0 top-full w-60 rounded-2xl border-border bg-background"
                    >
                        <ul role="listbox" aria-label={t('currency_choose')} className="max-h-72 overflow-y-auto p-1.5">
                            {currencies.map((item) => {
                                const selected = item.code === current;
                                return (
                                    <li key={item.code}>
                                        <button
                                            type="button"
                                            role="option"
                                            aria-selected={selected}
                                            onClick={() => {
                                                setCurrency(item.code);
                                                setOpen(false);
                                            }}
                                            className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-start text-sm transition hover:bg-foreground/10 ${selected ? 'bg-foreground/10 font-semibold' : ''
                                                }`}
                                        >
                                            <span className="min-w-0">
                                                <span dir="ltr" className="block font-semibold">
                                                    {item.code}
                                                </span>
                                                <span className="block text-xs truncate text-muted">{label(item.code)}</span>
                                            </span>
                                            {selected && <Check size={16} className="shrink-0" />}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                        {attribution && (
                            <p className="border-t border-border px-3 py-2 text-[11px] text-muted">
                                {t('currency_attribution')}{' '}
                                <a
                                    href="https://www.exchangerate-api.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline"
                                >
                                    ExchangeRate-API
                                </a>
                            </p>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}