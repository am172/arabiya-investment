import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const STYLES = {
  success: { icon: CheckCircle2, cls: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
  error: { icon: AlertCircle, cls: 'border-red-200 bg-red-50 text-red-800' },
  info: { icon: Info, cls: 'border-sky-200 bg-sky-50 text-sky-800' }
};

export default function Toast({ toasts, onClose }) {
  return (
    <div className="pointer-events-none fixed end-4 top-4 z-[60] flex w-full max-w-sm flex-col gap-3">
      {toasts.map((toast) => {
        const { icon: Icon, cls } = STYLES[toast.type] || STYLES.info;
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-lg ${cls}`}
          >
            <Icon size={18} className="mt-0.5 shrink-0" />
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button type="button" onClick={() => onClose(toast.id)}>
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}