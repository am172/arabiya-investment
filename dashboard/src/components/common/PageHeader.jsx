import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { t } from '../../i18n';

export default function PageHeader({ title, description, backTo, action }) {
  return (
    <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {backTo && (
          <Link
            to={backTo}
            className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
          >
            <ArrowRight size={14} />
            {t('Back')}
          </Link>
        )}
        <h1 className="text-2xl font-bold text-slate-900">{t(title)}</h1>
        {description && <p className="mt-1 text-sm text-slate-500">{t(description)}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}