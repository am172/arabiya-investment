import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import { t } from '../../i18n';

export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  danger = true,
  onConfirm,
  onCancel
}) {
  return (
    <Modal open={open} onClose={onCancel} size="sm">
      <div className="flex gap-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            danger ? 'bg-red-50 text-red-600' : 'bg-brand-50 text-brand-600'
          }`}
        >
          <AlertTriangle size={20} />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-900">{t(title)}</h3>
          {message && <p className="mt-1 text-sm text-slate-500">{t(message)}</p>}
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          {t('Cancel')}
        </button>
        <button type="button" className={danger ? 'btn-danger' : 'btn-primary'} onClick={onConfirm}>
          {t(confirmLabel)}
        </button>
      </div>
    </Modal>
  );
}