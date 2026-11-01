import { t } from '../../i18n';

export default function FormTextarea({ label, error, hint, className = '', rows = 4, ...props }) {
  return (
    <div className={className}>
      {label && <label className="label">{t(label)}</label>}
      <textarea rows={rows} className={`input resize-y ${error ? 'input-error' : ''}`} {...props} />
      {hint && !error && <p className="hint">{t(hint)}</p>}
      {error && <p className="error-text">{t(error)}</p>}
    </div>
  );
}