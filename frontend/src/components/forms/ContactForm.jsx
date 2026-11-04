'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, Send } from 'lucide-react';
import FormField, { controlClass, fieldAria } from '@/components/catalog/FormField';
import { useT } from '@/components/providers/TextsProvider';
import { sendContactMessage } from '@/lib/api/contact';
import { toErrorMap } from '@/lib/api/requests';
import { trackEvent } from '@/lib/analytics/tracker';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMPTY = { name: '', email: '', phone: '', subject: '', message: '', website: '' };

export default function ContactForm({ className = '' }) {
  const t = useT();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const setField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => (current[name] ? { ...current, [name]: undefined } : current));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (sending) return;

    const found = {};
    if (!form.name.trim()) found.name = t('contactForm_errName');
    if (!EMAIL.test(form.email.trim())) found.email = t('contactForm_errEmail');
    if (form.message.trim().length < 10) found.message = t('contactForm_errMessage');

    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSending(true);
    setFormError('');
    try {
      await sendContactMessage({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
        website: form.website
      });
      trackEvent('FORM_SUBMIT', 'contact');
      setSent(true);
      setForm(EMPTY);
    } catch (error) {
      const map = toErrorMap(error.errors);
      const next = {};
      if (map.name) next.name = t('contactForm_errName');
      if (map.email) next.email = t('contactForm_errEmail');
      if (map.message) next.message = t('contactForm_errMessage');
      setErrors(next);
      if (Object.keys(next).length === 0) setFormError(t('contactForm_errGeneric'));
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div
        role="status"
        className={`flex flex-col items-center gap-4 rounded-theme border border-border bg-surface px-6 py-14 text-center ${className}`}
      >
        <motion.span
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className="flex items-center justify-center w-20 h-20 rounded-full bg-success/15 text-success"
        >
          <CheckCircle2 size={44} />
        </motion.span>
        <h3 className="text-2xl font-extrabold">{t('contactForm_successTitle')}</h3>
        <p className="max-w-md leading-8 text-muted">{t('contactForm_successText')}</p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="px-6 py-3 mt-2 text-sm font-semibold transition border rounded-full border-border hover:border-primary hover:text-primary"
        >
          {t('contactForm_another')}
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className={`relative space-y-4 rounded-theme border border-border bg-surface p-6 sm:p-8 ${className}`}
    >
      {formError && (
        <p role="alert" className="px-4 py-3 text-sm font-medium border rounded-xl border-error/30 bg-error/10 text-error">
          {formError}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="cf-name" label={t('contactForm_name')} required error={errors.name}>
          <input
            {...fieldAria('cf-name', errors.name)}
            dir="auto"
            autoComplete="name"
            className={controlClass(errors.name)}
            value={form.name}
            onChange={(event) => setField('name', event.target.value)}
          />
        </FormField>
        <FormField id="cf-email" label={t('contactForm_email')} required error={errors.email}>
          <input
            {...fieldAria('cf-email', errors.email)}
            type="email"
            dir="ltr"
            autoComplete="email"
            className={`${controlClass(errors.email)} text-start`}
            value={form.email}
            onChange={(event) => setField('email', event.target.value)}
          />
        </FormField>
        <FormField id="cf-phone" label={t('contactForm_phone')}>
          <input
            id="cf-phone"
            type="tel"
            dir="ltr"
            inputMode="tel"
            autoComplete="tel"
            className={`${controlClass()} text-start`}
            value={form.phone}
            onChange={(event) => setField('phone', event.target.value)}
          />
        </FormField>
        <FormField id="cf-subject" label={t('contactForm_subject')}>
          <input
            id="cf-subject"
            dir="auto"
            maxLength={150}
            className={controlClass()}
            value={form.subject}
            onChange={(event) => setField('subject', event.target.value)}
          />
        </FormField>
      </div>

      <FormField id="cf-message" label={t('contactForm_message')} required error={errors.message}>
        <textarea
          {...fieldAria('cf-message', errors.message)}
          dir="auto"
          rows={5}
          maxLength={3000}
          className={`${controlClass(errors.message)} resize-y`}
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

      <button
        type="submit"
        disabled={sending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:-translate-y-0.5 disabled:opacity-70 sm:w-auto"
      >
        {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="rtl:-scale-x-100" />}
        {sending ? t('contactForm_sending') : t('contactForm_submit')}
      </button>
    </form>
  );
}