import { Inbox } from 'lucide-react';
import { t } from '../../i18n';

export default function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center card">
      <div className="flex items-center justify-center mb-4 h-14 w-14 rounded-2xl bg-slate-100 text-slate-400">
        <Icon size={26} />
      </div>
      <h3 className="text-base font-semibold text-slate-800">{t(title)}</h3>
      {description && <p className="max-w-sm mt-1 text-sm text-slate-500">{t(description)}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}