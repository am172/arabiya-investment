import { useState } from 'react';
import { Plus } from 'lucide-react';
import statService from '../../services/stat.service';
import useResourceList from '../../hooks/useResourceList';
import useConfirm from '../../hooks/useConfirm';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/common/PageHeader';
import ListToolbar from '../../components/common/ListToolbar';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import RowActions from '../../components/common/RowActions';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Modal from '../../components/common/Modal';
import StatForm from '../../components/forms/StatForm';
import { formatNumber } from '../../utils/formatters';
import { t } from '../../i18n';

export default function StatsPage() {
  const list = useResourceList(statService);
  const toast = useToast();
  const { confirm, confirmProps } = useConfirm();
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [serverErrors, setServerErrors] = useState([]);

  const closeModal = () => {
    setEditing(null);
    setServerErrors([]);
  };

  const handleSave = async (payload) => {
    setSaving(true);
    setServerErrors([]);
    try {
      if (editing === 'new') await statService.create(payload);
      else await statService.update(editing._id, payload);
      toast.success('Stat saved successfully');
      closeModal();
      list.refetch();
    } catch (err) {
      setServerErrors(err.errors || []);
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (item) => {
    try {
      await statService.toggleStatus(item._id);
      list.refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (item) => {
    const ok = await confirm({
      title: 'Delete stat',
      message: t('"{label}" will be permanently removed.', { label: item.label }),
      confirmLabel: 'Delete'
    });
    if (!ok) return;
    try {
      await statService.remove(item._id);
      toast.success('Stat deleted');
      list.refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const columns = [
    { key: 'order', header: 'Order' },
    {
      key: 'label',
      header: 'Label',
      render: (item) => <span className="font-medium text-slate-900">{item.label}</span>
    },
    {
      key: 'value',
      header: 'Value',
      render: (item) => (
        <span dir="ltr">{`${item.prefix || ''}${formatNumber(item.value)}${item.suffix || ''}`}</span>
      )
    },
    { key: 'icon', header: 'Icon', render: (item) => item.icon || '—' },
    {
      key: 'isActive',
      header: 'Status',
      render: (item) => <StatusBadge status={item.isActive ? 'active' : 'inactive'} />
    },
    {
      key: 'actions',
      header: '',
      className: 'text-end',
      render: (item) => (
        <RowActions
          onEdit={() => setEditing(item)}
          isActive={item.isActive}
          onToggle={() => handleToggle(item)}
          onDelete={() => handleDelete(item)}
        />
      )
    }
  ];

  return (
    <div>
      <PageHeader
        title="Stats"
        description="Numbers shown in the statistics section of the landing page."
        action={
          <button type="button" className="btn-primary" onClick={() => setEditing('new')}>
            <Plus size={16} />
            {t('Add stat')}
          </button>
        }
      />
      <ListToolbar search={list.search} onSearch={list.setSearch} placeholder="Search stats" />
      <DataTable columns={columns} rows={list.items} loading={list.loading} />
      <Pagination meta={list.meta} onChange={list.setPage} />

      <Modal open={Boolean(editing)} onClose={closeModal} title={editing === 'new' ? 'Add stat' : 'Edit stat'}>
        {editing && (
          <StatForm
            key={editing === 'new' ? 'new' : editing._id}
            initialData={editing === 'new' ? null : editing}
            onSubmit={handleSave}
            onCancel={closeModal}
            submitting={saving}
            serverErrors={serverErrors}
          />
        )}
      </Modal>
      <ConfirmDialog {...confirmProps} />
    </div>
  );
}