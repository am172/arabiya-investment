import { useEffect, useState } from 'react';
import { Download, Trash2 } from 'lucide-react';
import requestService from '../../services/request.service';
import useResourceList from '../../hooks/useResourceList';
import useFetch from '../../hooks/useFetch';
import useConfirm from '../../hooks/useConfirm';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/common/PageHeader';
import ListToolbar from '../../components/common/ListToolbar';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import RequestStatusBadge from '../../components/requests/RequestStatusBadge';
import RequestDetail from '../../components/requests/RequestDetail';
import { REQUEST_STATUSES } from '../../constants/catalog';
import { formatDateTime } from '../../utils/formatters';
import { t } from '../../i18n';

export default function RequestsPage() {
    const list = useResourceList(requestService, { status: '', unread: '', from: '', to: '' });
    const stats = useFetch(() => requestService.stats(), []);
    const toast = useToast();
    const { confirm, confirmProps } = useConfirm();
    const [selected, setSelected] = useState([]);
    const [activeId, setActiveId] = useState('');

    useEffect(() => {
        setSelected([]);
    }, [list.page, list.filters, list.search]);

    const refresh = () => {
        list.refetch();
        stats.refetch();
        window.dispatchEvent(new Event('requests:changed'));
    };

    const removeSelected = async () => {
        const ok = await confirm({
            title: 'Delete requests',
            message: t('{n} selected request(s) will be permanently deleted.', { n: selected.length }),
            confirmLabel: 'Delete'
        });
        if (!ok) return;
        try {
            await requestService.bulkRemove(selected);
            toast.success('Requests deleted successfully');
            setSelected([]);
            refresh();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const exportCsv = async () => {
        const params = {};
        Object.entries(list.filters).forEach(([key, value]) => {
            if (value) params[key] = value;
        });
        if (list.search.trim()) params.search = list.search.trim();

        try {
            const blob = await requestService.exportCsv(params);
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'requests.csv';
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        } catch (err) {
            toast.error(err.message);
        }
    };

    const byStatus = (stats.data && stats.data.byStatus) || {};
    const tabs = [{ id: '', label: 'All', count: stats.data ? stats.data.total : null }, ...REQUEST_STATUSES.map((item) => ({ ...item, count: byStatus[item.id] }))];

    const columns = [
        {
            key: 'reference',
            header: 'Reference',
            render: (item) => (
                <span dir="ltr" className={`font-mono text-xs ${item.readAt ? 'text-slate-500' : 'font-bold text-slate-900'}`}>
                    {item.reference}
                </span>
            )
        },
        {
            key: 'name',
            header: 'Customer',
            render: (item) => (
                <div className="min-w-0">
                    <p dir="auto" className={`truncate ${item.readAt ? 'font-medium' : 'font-bold text-slate-900'}`}>
                        {item.name}
                    </p>
                    <p dir="auto" className="text-xs truncate text-slate-500">
                        {item.company || item.phone}
                    </p>
                </div>
            )
        },
        {
            key: 'items',
            header: 'Products',
            render: (item) => (
                <span dir="auto" className="text-slate-700">
                    {item.items[0] ? item.items[0].productName : '—'}
                    {item.items.length > 1 && <span className="text-xs ms-1 text-slate-400">+{item.items.length - 1}</span>}
                </span>
            )
        },
        { key: 'status', header: 'Status', render: (item) => <RequestStatusBadge status={item.status} /> },
        { key: 'createdAt', header: 'Received', render: (item) => formatDateTime(item.createdAt) }
    ];

    return (
        <div>
            <PageHeader
                title="Product requests"
                description="Requests customers send from the website, with the exact options they chose."
                action={
                    <button type="button" className="btn-secondary" onClick={exportCsv}>
                        <Download size={16} />
                        {t('Export CSV')}
                    </button>
                }
            />

            <div className="flex flex-wrap items-center gap-2 mb-4">
                {tabs.map((item) => (
                    <button
                        key={item.id || 'all'}
                        type="button"
                        onClick={() => list.setFilter('status', item.id)}
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition ${list.filters.status === item.id ? 'bg-brand-600 text-white' : 'bg-card text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
                            }`}
                    >
                        {t(item.label)}
                        {item.count !== null && item.count !== undefined && (
                            <span className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${list.filters.status === item.id ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
                                {item.count}
                            </span>
                        )}
                    </button>
                ))}
                <button
                    type="button"
                    aria-pressed={list.filters.unread === 'true'}
                    onClick={() => list.setFilter('unread', list.filters.unread === 'true' ? '' : 'true')}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${list.filters.unread === 'true' ? 'bg-rose-600 text-white' : 'bg-card text-rose-600 ring-1 ring-rose-200 hover:bg-rose-50'
                        }`}
                >
                    {t('Unread')} {stats.data ? `(${stats.data.unread})` : ''}
                </button>
            </div>

            <ListToolbar search={list.search} onSearch={list.setSearch} placeholder="Search by reference, customer, phone or product">
                <input
                    type="date"
                    dir="ltr"
                    aria-label={t('From')}
                    className="input sm:w-40"
                    value={list.filters.from}
                    onChange={(event) => list.setFilter('from', event.target.value)}
                />
                <input
                    type="date"
                    dir="ltr"
                    aria-label={t('To')}
                    className="input sm:w-40"
                    value={list.filters.to}
                    onChange={(event) => list.setFilter('to', event.target.value)}
                />
                {selected.length > 0 && (
                    <button type="button" className="btn-danger" onClick={removeSelected}>
                        <Trash2 size={16} />
                        {t('Delete ({n})', { n: selected.length })}
                    </button>
                )}
            </ListToolbar>

            <DataTable
                columns={columns}
                rows={list.items}
                loading={list.loading}
                selectable
                selected={selected}
                onSelectionChange={setSelected}
                onRowClick={(row) => setActiveId(row._id)}
            />
            <Pagination meta={list.meta} onChange={list.setPage} />

            {activeId && <RequestDetail id={activeId} onClose={() => setActiveId('')} onChanged={refresh} />}
            <ConfirmDialog {...confirmProps} />
        </div>
    );
}