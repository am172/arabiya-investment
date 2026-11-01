import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { t } from '../../i18n';

const LTR_TYPES = ['email', 'url', 'tel', 'number'];

export default function FormInput({ label, error, hint, className = '', type = 'text', ...props }) {
  const dir = LTR_TYPES.includes(type) ? 'ltr' : undefined;

  return (
    <div className={className}>
      {label && <label className="label">{t(label)}</label>}
      <input type={type} dir={dir} className={`input ${error ? 'input-error' : ''}`} {...props} />
      {hint && !error && <p className="hint">{t(hint)}</p>}
      {error && <p className="error-text">{t(error)}</p>}
    </div>
  );
}

export function FormToggle({ label, hint, checked, onChange, className = '' }) {
  return (
    <label className={`flex cursor-pointer items-start gap-3 ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="w-4 h-4 mt-1 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
      />
      <span>
        <span className="block text-sm font-medium text-slate-700">{t(label)}</span>
        {hint && <span className="block text-xs text-slate-500">{t(hint)}</span>}
      </span>
    </label>
  );
}

export function FormSection({ title, description, children }) {
  return (
    <section className="p-6 card">
      <h3 className="text-base font-semibold text-slate-900">{t(title)}</h3>
      {description && <p className="mt-1 text-sm text-slate-500">{t(description)}</p>}
      <div className="grid gap-5 mt-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export function FormActions({ cancelTo, submitting, submitLabel = 'Save' }) {
  return (
    <div className="flex items-center justify-end gap-3">
      {cancelTo && (
        <Link to={cancelTo} className="btn-secondary">
          {t('Cancel')}
        </Link>
      )}
      <button type="submit" disabled={submitting} className="btn-primary">
        {submitting && <Loader2 size={16} className="animate-spin" />}
        {t(submitLabel)}
      </button>
    </div>
  );
}