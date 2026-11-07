'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, X } from 'lucide-react';
import FormField, { controlClass, fieldAria } from '@/components/catalog/FormField';
import { useT } from '@/components/providers/TextsProvider';
import api from '@/lib/api/client';
import { submitProductRequest, toErrorMap } from '@/lib/api/requests';
import { trackEvent } from '@/lib/analytics/tracker';
import { arabic } from '@/lib/fonts';

const CHOICE = ['select', 'radio', 'checkbox'];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FOCUSABLE =
    'a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
const EMPTY_FORM = { name: '', company: '', phone: '', email: '', city: '', message: '', website: '' };

const initialAnswers = (options) =>
    options.reduce((acc, option) => {
        if (option.type === 'checkbox') {
            acc[option.key] = option.values.filter((value) => value.isDefault).map((value) => value.key);
        } else if (CHOICE.includes(option.type)) {
            const preset = option.values.find((value) => value.isDefault);
            acc[option.key] = preset ? preset.key : '';
        } else if (option.type === 'number') {
            acc[option.key] =
                option.defaultNumber === null || option.defaultNumber === undefined ? '' : String(option.defaultNumber);
        } else {
            acc[option.key] = '';
        }
        return acc;
    }, {});

const isEmpty = (value) =>
    value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);

const validateOptions = (options, answers, t) => {
    const errors = {};

    options.forEach((option) => {
        const value = answers[option.key];

        if (isEmpty(value)) {
            if (option.isRequired) errors[option.key] = t('request_errOption');
            return;
        }

        if (option.type === 'number') {
            const number = Number(value);
            const hasMin = option.min !== null && option.min !== undefined;
            const hasMax = option.max !== null && option.max !== undefined;

            if (!Number.isFinite(number)) errors[option.key] = t('request_errNumber');
            else if (hasMin && number < option.min) errors[option.key] = t('request_errMin', { n: option.min });
            else if (hasMax && number > option.max) errors[option.key] = t('request_errMax', { n: option.max });
            else if (option.step > 0) {
                const steps = (number - (hasMin ? option.min : 0)) / option.step;
                if (Math.abs(steps - Math.round(steps)) > 1e-9) errors[option.key] = t('request_errStep', { n: option.step });
            }
        } else if (option.type === 'text' || option.type === 'textarea') {
            const limit = option.maxLength || (option.type === 'textarea' ? 2000 : 300);
            if (String(value).trim().length > limit) errors[option.key] = t('request_errLength', { n: limit });
        }
    });

    return errors;
};

const buildAnswers = (options, answers) =>
    options.reduce((acc, option) => {
        const value = answers[option.key];
        if (isEmpty(value)) return acc;
        if (option.type === 'number') acc[option.key] = Number(value);
        else if (option.type === 'text' || option.type === 'textarea') {
            if (String(value).trim()) acc[option.key] = String(value).trim();
        } else acc[option.key] = value;
        return acc;
    }, {});

function OptionField({ option, value, error, onChange, t }) {
    const id = `req-${option.key}`;
    const common = {
        id,
        label: option.title,
        required: option.isRequired,
        requiredLabel: t('request_required'),
        error,
        hint: option.helpText
    };

    if (option.type === 'select') {
        return (
            <FormField {...common}>
                <select
                    {...fieldAria(id, error, option.helpText)}
                    dir="auto"
                    className={controlClass(error)}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                >
                    <option value="">{t('request_choose')}</option>
                    {option.values.map((item) => (
                        <option key={item.key} value={item.key}>
                            {item.label}
                        </option>
                    ))}
                </select>
            </FormField>
        );
    }

    if (option.type === 'radio' || option.type === 'checkbox') {
        const multiple = option.type === 'checkbox';
        const toggle = (key) =>
            onChange(value.includes(key) ? value.filter((item) => item !== key) : [...value, key]);

        return (
            <FormField {...common} group>
                <div className="grid gap-2 sm:grid-cols-2">
                    {option.values.map((item) => {
                        const checked = multiple ? value.includes(item.key) : value === item.key;
                        return (
                            <label
                                key={item.key}
                                className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-sm transition ${checked ? 'border-primary bg-primary/5' : 'border-border hover:border-foreground/30'
                                    }`}
                            >
                                <input
                                    type={multiple ? 'checkbox' : 'radio'}
                                    name={id}
                                    value={item.key}
                                    checked={checked}
                                    onChange={() => (multiple ? toggle(item.key) : onChange(item.key))}
                                    className="mt-1 accent-primary"
                                />
                                <span>
                                    <span className="block font-medium">{item.label}</span>
                                    {item.description && <span className="block text-xs text-muted">{item.description}</span>}
                                </span>
                            </label>
                        );
                    })}
                </div>
            </FormField>
        );
    }

    if (option.type === 'number') {
        return (
            <FormField {...common}>
                <div dir="ltr" className="relative">
                    <input
                        {...fieldAria(id, error, option.helpText)}
                        type="number"
                        inputMode="decimal"
                        min={option.min ?? undefined}
                        max={option.max ?? undefined}
                        step={option.step ?? 'any'}
                        placeholder={option.placeholder}
                        className={`${controlClass(error)} text-start ${option.unit ? 'pe-20' : ''}`}
                        value={value}
                        onChange={(event) => onChange(event.target.value)}
                    />
                    {option.unit && (
                        <span className="absolute text-sm -translate-y-1/2 pointer-events-none end-4 top-1/2 text-muted">
                            {option.unit}
                        </span>
                    )}
                </div>
            </FormField>
        );
    }

    if (option.type === 'textarea') {
        return (
            <FormField {...common}>
                <textarea
                    {...fieldAria(id, error, option.helpText)}
                    dir="auto"
                    rows={3}
                    maxLength={option.maxLength || 2000}
                    placeholder={option.placeholder}
                    className={`${controlClass(error)} resize-y`}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                />
            </FormField>
        );
    }

    return (
        <FormField {...common}>
            <input
                {...fieldAria(id, error, option.helpText)}
                type="text"
                dir="auto"
                maxLength={option.maxLength || 300}
                placeholder={option.placeholder}
                className={controlClass(error)}
                value={value}
                onChange={(event) => onChange(event.target.value)}
            />
        </FormField>
    );
}

export default function RequestModal({ product, onClose }) {
    const t = useT();
    const reduced = useReducedMotion();
    const panelRef = useRef(null);

    const [detail, setDetail] = useState(product.options ? product : null);
    const [failed, setFailed] = useState(false);
    const [answers, setAnswers] = useState(() => (product.options ? initialAnswers(product.options) : {}));
    const [step, setStep] = useState(product.options && product.options.length === 0 ? 'details' : 'options');
    const [form, setForm] = useState(EMPTY_FORM);
    const [optionErrors, setOptionErrors] = useState({});
    const [fieldErrors, setFieldErrors] = useState({});
    const [formError, setFormError] = useState('');
    const [sending, setSending] = useState(false);
    const [done, setDone] = useState(null);

    const options = detail ? detail.options || [] : [];
    const hasOptions = options.length > 0;

    useEffect(() => {
        if (product.options) return undefined;
        let active = true;

        api
            .get(`/public/catalog/products/${encodeURIComponent(product.slug)}`)
            .then((res) => {
                if (!active) return;
                const loaded = res.data;
                setDetail(loaded);
                setAnswers(initialAnswers(loaded.options || []));
                if (!(loaded.options || []).length) setStep('details');
            })
            .catch(() => active && setFailed(true));

        return () => {
            active = false;
        };
    }, [product]);

    useEffect(() => {
        const previous = document.activeElement;
        const overflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        if (panelRef.current) panelRef.current.focus();

        const onKey = (event) => {
            if (event.key === 'Escape') {
                onClose();
                return;
            }
            if (event.key !== 'Tab' || !panelRef.current) return;
            const items = [...panelRef.current.querySelectorAll(FOCUSABLE)];
            if (items.length === 0) return;
            const first = items[0];
            const last = items[items.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = overflow;
            if (previous && previous.focus) previous.focus();
        };
    }, [onClose]);

    const scrollToError = () =>
        requestAnimationFrame(() => {
            const target = panelRef.current && panelRef.current.querySelector('[role="alert"]');
            if (target) target.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
        });

    const setAnswer = (key, value) => {
        setAnswers((current) => ({ ...current, [key]: value }));
        setOptionErrors((current) => (current[key] ? { ...current, [key]: undefined } : current));
    };

    const setField = (name, value) => {
        setForm((current) => ({ ...current, [name]: value }));
        setFieldErrors((current) => (current[name] ? { ...current, [name]: undefined } : current));
    };

    const goDetails = () => {
        const found = validateOptions(options, answers, t);
        setOptionErrors(found);
        if (Object.keys(found).length > 0) {
            scrollToError();
            return;
        }
        setStep('details');
    };

    const submit = async (event) => {
        event.preventDefault();
        if (sending) return;

        const found = {};
        if (!form.name.trim()) found.name = t('request_errName');
        const digits = form.phone.replace(/\D/g, '');
        if (digits.length < 7 || digits.length > 15) found.phone = t('request_errPhone');
        if (form.email.trim() && !EMAIL.test(form.email.trim())) found.email = t('request_errEmail');
        const invalidOptions = validateOptions(options, answers, t);

        setFieldErrors(found);
        setOptionErrors(invalidOptions);

        if (Object.keys(invalidOptions).length > 0) {
            setStep('options');
            scrollToError();
            return;
        }
        if (Object.keys(found).length > 0) {
            scrollToError();
            return;
        }

        setSending(true);
        setFormError('');
        try {
            const data = await submitProductRequest({
                name: form.name.trim(),
                company: form.company.trim(),
                phone: form.phone.trim(),
                email: form.email.trim(),
                city: form.city.trim(),
                message: form.message.trim(),
                website: form.website,
                pageUrl: window.location.href,
                items: [{ product: detail._id, options: buildAnswers(options, answers) }]
            });
            trackEvent('FORM_SUBMIT', 'product-request');
            setDone({ reference: data && data.reference });
        } catch (error) {
            const nextFields = {};
            const nextOptions = {};
            Object.keys(toErrorMap(error.errors)).forEach((field) => {
                const match = field.match(/^items\[\d+\]\.options\.(.+)$/);
                if (match) nextOptions[match[1]] = t('request_errOption');
                else if (field === 'name') nextFields.name = t('request_errName');
                else if (field === 'phone') nextFields.phone = t('request_errPhone');
                else if (field === 'email') nextFields.email = t('request_errEmail');
            });
            setFieldErrors(nextFields);
            setOptionErrors(nextOptions);
            if (Object.keys(nextOptions).length > 0) setStep('options');
            setFormError(
                Object.keys(nextFields).length + Object.keys(nextOptions).length > 0 ? '' : t('request_errGeneric')
            );
            scrollToError();
        } finally {
            setSending(false);
        }
    };

    const restart = () => {
        setDone(null);
        setForm(EMPTY_FORM);
        setAnswers(initialAnswers(options));
        setOptionErrors({});
        setFieldErrors({});
        setStep(hasOptions ? 'options' : 'details');
    };

    const unavailable = detail && detail.allowOrderRequest === false;
    const loading = !detail && !failed;

    return createPortal(
        <div
            // dir="rtl"
            // lang="ar"
            className={`${arabic.variable} font-arabic fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6`}
            role="presentation"
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <motion.div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="request-title"
                tabIndex={-1}
                initial={reduced ? false : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="relative flex max-h-[94svh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[1.75rem] border border-border bg-background text-foreground shadow-2xl outline-none sm:rounded-theme"
            >
                <header className="flex items-start justify-between gap-4 px-6 py-5 border-b border-border">
                    <div className="min-w-0">
                        <h2 id="request-title" className="text-xl font-extrabold">
                            {t('request_title')}
                        </h2>
                        <p className="mt-1 text-sm truncate text-muted">{product.name}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label={t('request_close')}
                        className="flex items-center justify-center w-10 h-10 transition rounded-full shrink-0 hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                        <X size={20} />
                    </button>
                </header>

                {done ? (
                    <div className="flex flex-col items-center gap-4 px-6 text-center py-14">
                        <motion.span
                            initial={reduced ? false : { scale: 0.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                            className="flex items-center justify-center w-20 h-20 rounded-full bg-success/15 text-success"
                        >
                            <CheckCircle2 size={44} />
                        </motion.span>
                        <h3 className="text-2xl font-extrabold">{t('request_successTitle')}</h3>
                        <p className="max-w-md leading-8 text-muted">{t('request_successText')}</p>
                        {done.reference && (
                            <p className="px-5 py-2 text-sm font-semibold rounded-full bg-foreground/10">
                                {t('request_reference')}: <span dir="ltr">{done.reference}</span>
                            </p>
                        )}
                        <div className="flex flex-wrap justify-center gap-3 mt-2">
                            <button
                                type="button"
                                onClick={restart}
                                className="px-6 py-3 text-sm font-semibold transition border rounded-full border-border hover:border-primary hover:text-primary"
                            >
                                {t('request_another')}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 text-sm font-semibold rounded-full bg-primary text-primary-foreground"
                            >
                                {t('request_close')}
                            </button>
                        </div>
                    </div>
                ) : loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-primary" />
                    </div>
                ) : failed || unavailable ? (
                    <div className="px-6 text-center py-14">
                        <p className="text-muted">{unavailable ? t('catalog_unavailable') : t('request_errGeneric')}</p>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 mt-6 text-sm font-semibold transition border rounded-full border-border hover:border-primary"
                        >
                            {t('request_close')}
                        </button>
                    </div>
                ) : (
                    <form onSubmit={submit} noValidate className="flex flex-col flex-1 min-h-0">
                        <div className="flex-1 min-h-0 px-6 py-6 space-y-5 overflow-y-auto">
                            <p className="text-sm leading-7 text-muted">{t('request_subtitle')}</p>

                            {hasOptions && (
                                <ol className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                                    {[
                                        ['options', 'request_stepOptions'],
                                        ['details', 'request_stepDetails']
                                    ].map(([id, key], index) => (
                                        <li
                                            key={id}
                                            aria-current={step === id ? 'step' : undefined}
                                            className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 ${step === id ? 'bg-primary text-primary-foreground' : 'bg-foreground/10 text-muted'
                                                }`}
                                        >
                                            <span>{index + 1}</span>
                                            {t(key)}
                                        </li>
                                    ))}
                                </ol>
                            )}

                            {formError && (
                                <p role="alert" className="px-4 py-3 text-sm font-medium border rounded-xl border-error/30 bg-error/10 text-error">
                                    {formError}
                                </p>
                            )}

                            {step === 'options' && (
                                <div className="space-y-5">
                                    {options.map((option) => (
                                        <OptionField
                                            key={option.key}
                                            option={option}
                                            value={answers[option.key]}
                                            error={optionErrors[option.key]}
                                            onChange={(value) => setAnswer(option.key, value)}
                                            t={t}
                                        />
                                    ))}
                                </div>
                            )}

                            {step === 'details' && (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <FormField id="req-name" label={t('request_name')} required requiredLabel={t('request_required')} error={fieldErrors.name}>
                                        <input
                                            {...fieldAria('req-name', fieldErrors.name)}
                                            dir="auto"
                                            autoComplete="name"
                                            className={controlClass(fieldErrors.name)}
                                            value={form.name}
                                            onChange={(event) => setField('name', event.target.value)}
                                        />
                                    </FormField>
                                    <FormField id="req-company" label={t('request_company')}>
                                        <input
                                            id="req-company"
                                            dir="auto"
                                            autoComplete="organization"
                                            className={controlClass()}
                                            value={form.company}
                                            onChange={(event) => setField('company', event.target.value)}
                                        />
                                    </FormField>
                                    <FormField
                                        id="req-phone"
                                        label={t('request_phone')}
                                        required
                                        requiredLabel={t('request_required')}
                                        error={fieldErrors.phone}
                                        hint={t('request_phoneHint')}
                                    >
                                        <input
                                            {...fieldAria('req-phone', fieldErrors.phone, t('request_phoneHint'))}
                                            type="tel"
                                            dir="ltr"
                                            inputMode="tel"
                                            autoComplete="tel"
                                            className={`${controlClass(fieldErrors.phone)} text-start`}
                                            value={form.phone}
                                            onChange={(event) => setField('phone', event.target.value)}
                                        />
                                    </FormField>
                                    <FormField id="req-email" label={t('request_email')} error={fieldErrors.email}>
                                        <input
                                            {...fieldAria('req-email', fieldErrors.email)}
                                            type="email"
                                            dir="ltr"
                                            autoComplete="email"
                                            className={`${controlClass(fieldErrors.email)} text-start`}
                                            value={form.email}
                                            onChange={(event) => setField('email', event.target.value)}
                                        />
                                    </FormField>
                                    <FormField id="req-city" label={t('request_city')} className="sm:col-span-2">
                                        <input
                                            id="req-city"
                                            dir="auto"
                                            autoComplete="address-level2"
                                            className={controlClass()}
                                            value={form.city}
                                            onChange={(event) => setField('city', event.target.value)}
                                        />
                                    </FormField>
                                    <FormField id="req-message" label={t('request_message')} className="sm:col-span-2">
                                        <textarea
                                            id="req-message"
                                            dir="auto"
                                            rows={3}
                                            maxLength={3000}
                                            className={`${controlClass()} resize-y`}
                                            value={form.message}
                                            onChange={(event) => setField('message', event.target.value)}
                                        />
                                    </FormField>

                                    <div aria-hidden="true" className="absolute -start-[9999px] h-0 w-0 overflow-hidden">
                                        <label>
                                            Website
                                            <input
                                                tabIndex={-1}
                                                autoComplete="off"
                                                value={form.website}
                                                onChange={(event) => setField('website', event.target.value)}
                                            />
                                        </label>
                                    </div>

                                    <p className="text-xs leading-6 text-muted sm:col-span-2">{t('request_privacy')}</p>
                                </div>
                            )}
                        </div>

                        <footer className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border bg-surface">
                            {step === 'details' && hasOptions ? (
                                <button
                                    type="button"
                                    onClick={() => setStep('options')}
                                    className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold transition border rounded-full border-border hover:border-primary hover:text-primary"
                                >
                                    <ArrowRight size={16} aria-hidden="true" />
                                    {t('request_stepOptions')}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-5 py-3 text-sm font-semibold transition border rounded-full border-border hover:border-foreground/40"
                                >
                                    {t('request_cancel')}
                                </button>
                            )}

                            {step === 'options' && hasOptions ? (
                                <button
                                    type="button"
                                    onClick={goDetails}
                                    className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:-translate-y-0.5"
                                >
                                    {t('request_stepDetails')}
                                    <ArrowLeft size={16} aria-hidden="true" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={sending}
                                    className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:-translate-y-0.5 disabled:opacity-70"
                                >
                                    {sending && <Loader2 size={16} className="animate-spin" />}
                                    {sending ? t('request_sending') : t('request_submit')}
                                </button>
                            )}
                        </footer>
                    </form>
                )}
            </motion.div>
        </div>,
        document.body
    );
}