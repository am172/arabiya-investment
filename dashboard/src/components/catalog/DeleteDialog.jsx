import { useEffect, useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import Modal from '../common/Modal';
import { t } from '../../i18n';

const STRATEGIES = [
    {
        id: 'promote',
        title: 'Move the items inside up one level',
        text: 'The items inside stay on the website under the parent level.'
    },
    {
        id: 'cascade',
        title: 'Delete everything inside too',
        text: 'All nested items and their images are deleted permanently.'
    }
];

export default function DeleteDialog({ name, itemCount = 1, childrenCount = 0, busy = false, onConfirm, onClose }) {
    const [strategy, setStrategy] = useState('promote');

    useEffect(() => {
        setStrategy('promote');
    }, [name, itemCount]);

    return (
        <Modal open onClose={onClose} size="sm">
            <div className="flex gap-4">
                <span className="flex items-center justify-center w-10 h-10 text-red-600 rounded-full shrink-0 bg-red-50">
                    <AlertTriangle size={20} />
                </span>
                <div>
                    <h3 className="text-base font-semibold text-slate-900">
                        {itemCount > 1 ? t('Delete {n} items', { n: itemCount }) : t('Delete item')}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                        {itemCount > 1
                            ? t('These items will be permanently deleted.')
                            : t('"{name}" will be permanently deleted.', { name })}
                    </p>
                </div>
            </div>

            {childrenCount > 0 && (
                <div className="mt-5 space-y-2">
                    <p className="text-sm font-medium text-slate-700">
                        {t('There are {n} item(s) inside. Choose what happens to them:', { n: childrenCount })}
                    </p>
                    {STRATEGIES.map((item) => (
                        <label
                            key={item.id}
                            className={`flex cursor-pointer gap-3 rounded-xl border p-3 transition ${strategy === item.id ? 'border-brand-500 bg-brand-50' : 'border-slate-200'
                                }`}
                        >
                            <input
                                type="radio"
                                name="strategy"
                                checked={strategy === item.id}
                                onChange={() => setStrategy(item.id)}
                                className="mt-1"
                            />
                            <span>
                                <span className="block text-sm font-semibold text-slate-900">{t(item.title)}</span>
                                <span className="block text-xs text-slate-500">{t(item.text)}</span>
                            </span>
                        </label>
                    ))}
                </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
                <button type="button" className="btn-secondary" onClick={onClose}>
                    {t('Cancel')}
                </button>
                <button
                    type="button"
                    className="btn-danger"
                    disabled={busy}
                    onClick={() => onConfirm(childrenCount > 0 ? strategy : undefined)}
                >
                    {busy && <Loader2 size={16} className="animate-spin" />}
                    {t('Delete')}
                </button>
            </div>
        </Modal>
    );
}