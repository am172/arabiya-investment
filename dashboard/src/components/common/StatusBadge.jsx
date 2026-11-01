import { t } from '../../i18n';

const STYLES = {
  active: 'bg-emerald-50 text-emerald-700',
  inactive: 'bg-slate-100 text-slate-600',
  featured: 'bg-amber-50 text-amber-700',
  popular: 'bg-brand-50 text-brand-700',
  new: 'bg-rose-50 text-rose-700',
  read: 'bg-slate-100 text-slate-600',
  replied: 'bg-emerald-50 text-emerald-700',
  archived: 'bg-slate-100 text-slate-500',
  upload: 'bg-sky-50 text-sky-700',
  youtube: 'bg-red-50 text-red-700',
  vimeo: 'bg-cyan-50 text-cyan-700',
  super_admin: 'bg-purple-50 text-purple-700',
  admin: 'bg-slate-100 text-slate-600'
};

export default function StatusBadge({ status, label }) {
  const text = label ? t(label) : t(String(status));
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
        STYLES[status] || STYLES.inactive
      }`}
    >
      {text}
    </span>
  );
}