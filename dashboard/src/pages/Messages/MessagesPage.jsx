import { useEffect, useState } from 'react';
import { CheckCheck, Trash2 } from 'lucide-react';
import messageService from '../../services/message.service';
import useResourceList from '../../hooks/useResourceList';
import useConfirm from '../../hooks/useConfirm';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/common/PageHeader';
import ListToolbar from '../../components/common/ListToolbar';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Modal from '../../components/common/Modal';
import { formatDateTime } from '../../utils/formatters';
import { t } from '../../i18n';

const TABS = ['', 'new', 'read', 'replied', 'archived'];
const STATUSES = ['new', 'read', 'replied', 'archived'];

const notify = () => window.dispatchEvent(new Event('messages:changed'));

function Detail({ label, children, dir }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{t(label)}</p>
      <div dir={dir} className="font-medium text-start text-slate-900">
        {children}
      </div>
    </div>
  );
}

export default function MessagesPage() {
  const list = useResourceList(messageService, { status: '' });
  const toast = useToast();
  const { confirm, confirmProps } = useConfirm();
  const [selected, setSelected] = useState([]);
  const [active, setActive] = useState(null);

  useEffect(() => {
    setSelected([]);
  }, [list.page, list.filters, list.search]);

  const run = async (action, successMessage) => {
    try {
      const res = await action();
      if (successMessage) toast.success(successMessage);
      list.refetch();
      notify();
      return res;
    } catch (err) {
      toast.error(err.message);
      return null;
    }
  };

  const openMessage = async (row) => {
    const res = await run(() => messageService.get(row._id));
    if (res) setActive(res.data);
  };

  const changeStatus = async (status) => {
    const res = await run(() => messageService.updateStatus(active._id, status));
    if (res) setActive(res.data);
  };

  const removeActive = async () => {
    const ok = await confirm({
      title: 'Delete message',
      message: t('The message from {name} will be permanently deleted.', { name: active.name }),
      confirmLabel: 'Delete'
    });
    if (!ok) return;
    const res = await run(() => messageService.remove(active._id), 'Message deleted');
    if (res) setActive(null);
  };

  const removeSelected = async () => {
    const ok = await confirm({
      title: 'Delete messages',
      message: t('{n} selected message(s) will be permanently deleted.', { n: selected.length }),
      confirmLabel: 'Delete'
    });
    if (!ok) return;
    const res = await run(() => messageService.bulkDelete(selected), 'Messages deleted');
    if (res) setSelected([]);
  };

  const columns = [
    {
      key: 'name',
      header: 'Sender',
      render: (item) => (
        <div className="min-w-0">
          <p className={`truncate ${item.status === 'new' ? 'font-bold text-slate-900' : 'font-medium'}`}>
            {item.name}
          </p>
          <p dir="ltr" className="text-xs truncate text-start text-slate-500">
            {item.email}
          </p>
        </div>
      )
    },
    {
      key: 'subject',
      header: 'Subject',
      render: (item) => <span className="line-clamp-1">{item.subject || item.message}</span>
    },
    { key: 'status', header: 'Status', render: (item) => <StatusBadge status={item.status} /> },
    { key: 'createdAt', header: 'Received', render: (item) => formatDateTime(item.createdAt) }
  ];

  return (
    <div>
      <PageHeader
        title="Messages"
        description="Messages sent through the website contact form."
        action={
          <button
            type="button"
            className="btn-secondary"
            onClick={() => run(() => messageService.markAllRead(), 'All messages marked as read')}
          >
            <CheckCheck size={16} />
            {t('Mark all as read')}
          </button>
        }
      />

      <div className="flex flex-wrap gap-2 mb-4">
        {TABS.map((tab) => (
          <button
            key={tab || 'all'}
            type="button"
            onClick={() => list.setFilter('status', tab)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              (list.filters.status || '') === tab
                ? 'bg-brand-600 text-white'
                : 'bg-card text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab ? t(tab) : t('All')}
          </button>
        ))}
      </div>

      <ListToolbar
        search={list.search}
        onSearch={list.setSearch}
        placeholder="Search by name, email or subject"
      >
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
        onRowClick={openMessage}
      />
      <Pagination meta={list.meta} onChange={list.setPage} />

      <Modal open={Boolean(active)} onClose={() => setActive(null)} title="Message details" size="lg">
        {active && (
          <div className="space-y-5">
            <div className="grid gap-4 text-sm sm:grid-cols-2">
              <Detail label="Name">{active.name}</Detail>
              <Detail label="Email" dir="ltr">
                <a href={`mailto:${active.email}`} className="text-brand-600 hover:underline">
                  {active.email}
                </a>
              </Detail>
              <Detail label="Phone" dir="ltr">
                {active.phone || '—'}
              </Detail>
              <Detail label="Received">{formatDateTime(active.createdAt)}</Detail>
              <Detail label="Child age">{active.childAge || '—'}</Detail>
              <Detail label="Package interest">{active.packageInterest || '—'}</Detail>
            </div>

            <Detail label="Subject">{active.subject || '—'}</Detail>

            <div className="p-4 rounded-xl bg-slate-50">
              <p className="text-sm whitespace-pre-wrap text-slate-700">{active.message}</p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => changeStatus(status)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                      active.status === status
                        ? 'bg-brand-600 text-white'
                        : 'bg-card text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {t(status)}
                  </button>
                ))}
              </div>
              <button type="button" className="btn-danger" onClick={removeActive}>
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