'use client';

import { useEffect, useRef, useState } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';

if (typeof window !== 'undefined' && typeof Node === 'function' && Node.prototype) {
    const origRemove = Node.prototype.removeChild;
    Node.prototype.removeChild = function (child) {
        if (child.parentNode !== this) return child;
        return origRemove.apply(this, arguments);
    };
    const origInsert = Node.prototype.insertBefore;
    Node.prototype.insertBefore = function (newNode, refNode) {
        if (refNode && refNode.parentNode !== this) return newNode;
        return origInsert.apply(this, arguments);
    };
}

const STORAGE_KEY = 'site-lang';

const LANGUAGES = [
    { code: 'ar', label: 'العربية', short: 'AR' },
    { code: 'en', label: 'English', short: 'EN' }
];

function readStoredLang() {
    try {
        return window.localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'ar';
    } catch (error) {
        return 'ar';
    }
}

function storeLang(targetLang) {
    try {
        window.localStorage.setItem(STORAGE_KEY, targetLang);
    } catch (error) {
        return;
    }
}

function writeTranslateCookie(value) {
    const host = window.location.hostname;
    if (value) {
        document.cookie = `googtrans=${value}; path=/`;
        document.cookie = `googtrans=${value}; path=/; domain=${host}`;
        return;
    }
    const expired = 'expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = `googtrans=; path=/; ${expired}`;
    document.cookie = `googtrans=; path=/; domain=${host}; ${expired}`;
    document.cookie = `googtrans=; path=/; domain=.${host}; ${expired}`;
}

function applyPageDirection(targetLang) {
    document.documentElement.dir = targetLang === 'en' ? 'ltr' : 'rtl';
    document.documentElement.lang = targetLang;
}

export default function LanguageSwitcher({ className = '' }) {
    const [lang, setLang] = useState('ar');
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const initialLang = readStoredLang();
        setLang(initialLang);
        applyPageDirection(initialLang);
        writeTranslateCookie(initialLang === 'en' ? '/ar/en' : '');

        if (!document.getElementById('gt-hidden-wrapper')) {
            const wrapper = document.createElement('div');
            wrapper.id = 'gt-hidden-wrapper';
            wrapper.className = 'hidden';
            wrapper.setAttribute('translate', 'no');
            document.body.appendChild(wrapper);
        }

        if (!document.getElementById('gtranslate-script')) {
            window.gtranslateSettings = {
                default_language: 'ar',
                languages: ['ar', 'en'],
                wrapper_selector: '#gt-hidden-wrapper',
                detect_browser_language: false,
                auto_switch: false
            };

            const script = document.createElement('script');
            script.id = 'gtranslate-script';
            script.src = 'https://cdn.gtranslate.net/widgets/latest/dropdown.js';
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        const handleEsc = (e) => {
            if (e.key === 'Escape') setOpen(false);
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEsc);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEsc);
        };
    }, []);

    const selectLanguage = (targetLang) => {
        setOpen(false);
        if (targetLang === lang) return;

        const pair = `ar|${targetLang}`;
        setLang(targetLang);
        storeLang(targetLang);
        applyPageDirection(targetLang);

        if (typeof window.doGTranslate === 'function') {
            window.doGTranslate(pair);
        } else {
            writeTranslateCookie(targetLang === 'en' ? '/ar/en' : '');
            window.location.reload();
        }
    };

    const currentObj = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

    return (
        <div
            ref={dropdownRef}
            translate="no"
            className={`notranslate relative inline-block text-start ${className}`}
        >
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                aria-expanded={open}
                aria-haspopup="listbox"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-theme border border-border bg-surface text-sm font-medium hover:opacity-80 transition cursor-pointer"
            >
                <Globe className="w-4 h-4 shrink-0" />
                <span>{currentObj.label}</span>
                <ChevronDown
                    className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                />
            </button>

            {open && (
                <div
                    role="listbox"
                    className="absolute z-50 py-1 mt-2 border shadow-lg end-0 w-36 rounded-theme border-border bg-surface"
                >
                    {LANGUAGES.map((item) => {
                        const active = item.code === lang;
                        return (
                            <button
                                key={item.code}
                                type="button"
                                role="option"
                                aria-selected={active}
                                onClick={() => selectLanguage(item.code)}
                                className={`w-full flex items-center justify-between px-3 py-2 text-sm transition cursor-pointer ${active
                                    ? 'font-semibold bg-black/5 dark:bg-white/10'
                                    : 'hover:bg-black/5 dark:hover:bg-white/5'
                                    }`}
                            >
                                <span>{item.label}</span>
                                {active && <Check className="w-4 h-4 shrink-0" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}