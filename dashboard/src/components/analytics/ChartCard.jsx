import { BarChart3 } from 'lucide-react';
import { t } from '../../i18n';

export function ChartEmpty({ message = 'No data for this period' }) {
  return (
    <div className="flex flex-col items-center justify-center h-56 gap-2 text-slate-400">
      <BarChart3 size={28} />
      <p className="text-sm">{t(message)}</p>
    </div>
  );
}

export default function ChartCard({ title, description, action, className = '', children }) {
  return (
    <section className={`card flex flex-col p-5 sm:p-6 ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{t(title)}</h3>
          {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
        </div>
        {action}
      </div>
      <div className="flex-1 min-h-0">{children}</div>
    </section>
  );
}