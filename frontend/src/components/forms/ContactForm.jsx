'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Send } from 'lucide-react';
import Field from '@/components/ui/Field';
import { useT } from '@/components/providers/TextsProvider';
import { sendContactMessage } from '@/lib/api/contact';
import { mapServerErrors, validateContact } from '@/lib/utils/validators';
import { trackEvent } from '@/lib/analytics/tracker';
import { NEW_SUBJECT_PARAM } from '@/lib/utils/contactTopics';
import { useContactStore } from '@/store/useContactStore';

const EMPTY = {
  name: '',
  email: '',
  phone: '',
  childAge: '',
  subject: '',
  packageInterest: '',
  message: '',
  website: ''
};

export default function ContactForm({ packages }) {
  const t = useT();
  const selectedPackage = useContactStore((state) => state.selectedPackage);
  const subject = useContactStore((state) => state.subject);
  const subjectKey = useContactStore((state) => state.subjectKey);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (selectedPackage) setForm((current) => ({ ...current, packageInterest: selectedPackage }));
  }, [selectedPackage]);

  useEffect(() => {
    if (subject) setForm((current) => ({ ...current, subject }));
  }, [subject, subjectKey]);

  useEffect(() => {
    const topic = new URLSearchParams(window.location.search).get('topic');
    if (topic === NEW_SUBJECT_PARAM) {
      setForm((current) => ({ ...current, subject: t('contact_subjectNew') }));
    }
  }, []);

  const bind = (name) => ({
    name,
    value: form[name],
    error: errors[name],
    onChange: (event) => setForm((current) => ({ ...current, [name]: event.target.value }))
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    const found = validateContact(form, t);
    setErrors(found);
    setServerError('');
    if (Object.keys(found).length > 0) return;

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      subject: form.subject.trim(),
      message: form.message.trim(),
      packageInterest: form.packageInterest,
      website: form.website
    };
    if (form.childAge !== '') payload.childAge = Number(form.childAge);

    setStatus('submitting');
    try {
      await sendContactMessage(payload);
      trackEvent('FORM_SUBMIT', 'contact');
      setForm(EMPTY);
      setStatus('success');
    } catch (err) {
      setErrors(mapServerErrors(err.errors));
      setServerError(err.message);
      setStatus('idle');
    }
  };

  const submitting = status === 'submitting';

  return (
    <AnimatePresence mode="wait" initial={false}>
      {status === 'success' ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="flex min-h-[26rem] flex-col items-center justify-center text-center"
        >
          <motion.svg viewBox="0 0 52 52" className="w-24 h-24 text-success" aria-hidden="true">
            <motion.circle
              cx="26"
              cy="26"
              r="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6 }}
            />
            <motion.path
              d="M14 27l8 8 16-17"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            />
          </motion.svg>
          <h3 className="mt-6 text-2xl font-bold">{t('contact_successTitle')}</h3>
          <p className="max-w-sm mt-2 text-muted">{t('contact_successText')}</p>
          <button
            type="button"
            onClick={() => setStatus('idle')}
            className="mt-8 rounded-full border border-border px-6 py-2.5 text-sm font-semibold transition hover:border-primary hover:text-primary"
          >
            {t('contact_another')}
          </button>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          onSubmit={handleSubmit}
          noValidate
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-5"
        >
          {serverError && (
            <div
              role="alert"
              className="px-4 py-3 text-sm font-medium border rounded-xl border-error/30 bg-error/10 text-error"
            >
              {serverError}
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label={t('contact_fName')}
              autoComplete="name"
              placeholder={t('contact_fNamePh')}
              {...bind('name')}
            />
            <Field
              label={t('contact_fEmail')}
              type="email"
              autoComplete="email"
              dir="ltr"
              placeholder="name@example.com"
              {...bind('email')}
            />
            <Field
              label={t('contact_fPhone')}
              type="tel"
              autoComplete="tel"
              dir="ltr"
              {...bind('phone')}
            />
            <Field
              label={t('contact_fAge')}
              type="number"
              min="1"
              max="18"
              {...bind('childAge')}
            />
          </div>

          <Field
            label={t('contact_fSubject')}
            list="contact-subjects"
            maxLength={150}
            placeholder={t('contact_fSubjectPh')}
            {...bind('subject')}
          />
          <datalist id="contact-subjects">
            <option value={t('contact_subjectNew')} />
            <option value={t('contact_subjectTrial')} />
            <option value={t('contact_subjectPackages')} />
            <option value={t('contact_subjectGeneral')} />
          </datalist>

          <Field as="select" label={t('contact_fPackage')} {...bind('packageInterest')}>
            <option value="">{t('contact_fPackageNone')}</option>
            {packages.map((pkg) => (
              <option key={pkg._id} value={pkg.name}>
                {pkg.name}
              </option>
            ))}
          </Field>

          <Field
            as="textarea"
            rows={5}
            label={t('contact_fMessage')}
            placeholder={t('contact_fMessagePh')}
            hint={`${form.message.length}/2000`}
            {...bind('message')}
          />

          <div aria-hidden="true" className="absolute -start-[9999px] h-0 w-0 overflow-hidden opacity-0">
            <label htmlFor="website">Website</label>
            <input
              id="website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={form.website}
              onChange={(event) => setForm((current) => ({ ...current, website: event.target.value }))}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/40 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
          >
            <span className="absolute inset-0 transition-transform duration-700 -translate-x-full pointer-events-none bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:translate-x-full" />
            <span className="relative inline-flex items-center gap-2">
              {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="rtl:-scale-x-100" />}
              {submitting ? t('contact_sending') : t('contact_send')}
            </span>
          </button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}