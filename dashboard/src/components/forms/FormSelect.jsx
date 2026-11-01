import { t } from '../../i18n';

export default function FormSelect({ label, error, hint, options, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <label className="label">{t(label)}</label>}
      <select className={`input ${error ? 'input-error' : ''}`} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {t(option.label)}
          </option>
        ))}
      </select>
      {hint && !error && <p className="hint">{t(hint)}</p>}
      {error && <p className="error-text">{t(error)}</p>}
    </div>
  );
}