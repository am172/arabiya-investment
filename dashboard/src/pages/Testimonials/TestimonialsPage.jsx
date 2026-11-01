import { useState } from 'react';
import { Plus, Star } from 'lucide-react';
import testimonialService from '../../services/testimonial.service';
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
import TestimonialForm from '../../components/forms/TestimonialForm';
import { initials, truncate } from '../../utils/formatters';
import { t } from '../../i18n';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' }
];

export default function TestimonialsPage() {
  const list = useResourceList(testimonialService);
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
      if (editing === 'new') await testimonialService.create(payload);
      else await testimonialService.update(editing._id, payload);
      toast.success('Review saved successfully');
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
      await testimonialService.toggleStatus(item._id);
      list.refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (item) => {
    const ok = await confirm({
      title: 'Delete review',
      message: t('The review from {name} will be permanently removed.', { name: item.name }),
      confirmLabel: 'Delete'
    });
    if (!ok) return;
    try {
      await testimonialService.remove(item._id);
      toast.success('Review deleted');
      list.refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Reviewer',
      render: (item) => (
        <div className="flex items-center gap-3">
          {item.avatar && item.avatar.url ? (
            <img src={item.avatar.url} alt="" className="object-cover w-10 h-10 rounded-full bg-slate-100" />
          ) : (
            <span className="flex items-center justify-center w-10 h-10 text-sm font-semibold rounded-full bg-brand-100 text-brand-700">
              {initials(item.name)}
            </span>
          )}
          <div className="min-w-0">
            <p className="font-medium truncate text-slate-900">{item.name}</p>
            <p className="text-xs truncate text-slate-500">{item.role || '—'}</p>
          </div>
        </div>
      )
    },
    {
      key: 'content',
      header: 'Review',
      render: (item) => <span className="text-slate-600">{truncate(item.content, 70)}</span>
    },
    {
      key: 'rating',
      header: 'Rating',
      render: (item) => (
        <span className="inline-flex items-center gap-1 font-medium text-slate-800">
          <Star size={15} className="fill-amber-400 text-amber-400" />
          {item.rating}
        </span>
      )
    },
    { key: 'order', header: 'Order' },
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
        title="Testimonials"
        description="Reviews shown in the scrolling wall on the public website."
        action={
          <button type="button" className="btn-primary" onClick={() => setEditing('new')}>
            <Plus size={16} />
            {t('Add review')}
          </button>
        }
      />
      <ListToolbar
        search={list.search}
        onSearch={list.setSearch}
        placeholder="Search by name, role or review"
        filter={{
          value: list.filters.isActive || '',
          onChange: (value) => list.setFilter('isActive', value),
          options: STATUS_OPTIONS
        }}
      />
      <DataTable columns={columns} rows={list.items} loading={list.loading} />
      <Pagination meta={list.meta} onChange={list.setPage} />

      <Modal
        open={Boolean(editing)}
        onClose={closeModal}
        title={editing === 'new' ? 'Add review' : 'Edit review'}
      >
        {editing && (
          <TestimonialForm
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