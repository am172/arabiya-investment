import { useState } from 'react';
import { Play, Trash2 } from 'lucide-react';
import whatsappService from '../../services/whatsapp.service';
import useResourceList from '../../hooks/useResourceList';
import useConfirm from '../../hooks/useConfirm';
import { useToast } from '../../context/ToastContext';
import DataTable from '../common/DataTable';
import Pagination from '../common/Pagination';
import ConfirmDialog from '../common/ConfirmDialog';
import Modal from '../common/Modal';
import { formatDateTime, truncate } from '../../utils/formatters';
import { t } from '../../i18n';

export default function ChatsPanel() {
    const list = useResourceList(whatsappService, { needsHuman: '' });
    const toast = useToast();
    const { confirm, confirmProps } = useConfirm();
    const [active, setActive] = useState(null);

    const run = async (action, message) => {
        try {
            await action();
            if (message) toast.success(message);
            list.refetch();
            return true;
        } catch (err) {
            toast.error(err.message);
            return false;
        }
    };

    const handleDelete = async (item) => {
        const ok = await confirm({
            title: 'Delete conversation',
            message: 'This conversation history will be removed.',
            confirmLabel: 'Delete'
        });
        if (ok && (await run(() => whatsappService.remove(item._id), 'Chat deleted successfully'))) setActive(null);
    };

    const columns = [
        {
            key: 'name',
            header: 'Contact',
            render: (item) => (
                <div className="min-w-0">
                    <p className="font-medium truncate text-slate-900">{item.name || '—'}</p>
                    <p dir="ltr" className="text-xs truncate text-start text-slate-500">
                        {item.phone ? `+${item.phone}` : ''}
                    </p>
                </div>
            )
        },
        {
            key: 'last',
            header: 'Last message',
            render: (item) => (
                <span dir="auto" className="text-slate-600">
                    {truncate((item.messages[item.messages.length - 1] || {}).text, 60)}
                </span>
            )
        },
        {
            key: 'needsHuman',
            header: 'Status',
            render: (item) =>
                item.needsHuman ? (
                    <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700">
                        {t('Needs a human')}
                    </span>
                ) : (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        {t('Bot active')}
                    </span>
                )
        },
        { key: 'lastMessageAt', header: 'Updated', render: (item) => formatDateTime(item.lastMessageAt) }
    ];

    return (
        <div>
            <div className="flex gap-2 mb-4">
                {[
                    { value: '', label: 'All' },
                    { value: 'true', label: 'Needs a human' }
                ].map((tab) => (
                    <button
                        key={tab.value || 'all'}
                        type="button"
                        onClick={() => list.setFilter('needsHuman', tab.value)}
                        className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${(list.filters.needsHuman || '') === tab.value
                                ? 'bg-brand-600 text-white'
                                : 'bg-card text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
                            }`}
                    >
                        {t(tab.label)}
                    </button>
                ))}
            </div>

            <DataTable columns={columns} rows={list.items} loading={list.loading} onRowClick={setActive} />
            <Pagination meta={list.meta} onChange={list.setPage} />

            <Modal open={Boolean(active)} onClose={() => setActive(null)} title="Conversation" size="lg">
                {active && (
                    <div className="space-y-4">
                        <div className="max-h-96 space-y-2.5 overflow-y-auto">
                            {active.messages.map((item, index) => (
                                <div key={index} className={`flex ${item.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                                    <p
                                        dir="auto"
                                        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm ${item.role === 'user' ? 'bg-slate-100 text-slate-800' : 'bg-brand-600 text-white'
                                            }`}
                                    >
                                        {item.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-wrap justify-end gap-3">
                            {active.needsHuman && (
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={async () => {
                                        if (await run(() => whatsappService.resume(active._id), 'Bot resumed for this chat')) {
                                            setActive(null);
                                        }
                                    }}
                                >
                                    <Play size={16} />
                                    {t('Resume the bot')}
                                </button>
                            )}
                            <button type="button" className="btn-danger" onClick={() => handleDelete(active)}>
                                <Trash2 size={16} />
                                {t('Delete')}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
            <ConfirmDialog {...confirmProps} />
        </div>
    );
}