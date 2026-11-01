import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import teacherService from '../../services/teacher.service';
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
import { ROUTES, withId } from '../../constants/routes';
import { truncate } from '../../utils/formatters';
import { t } from '../../i18n';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' }
];

export default function TeachersListPage() {
  const list = useResourceList(teacherService);
  const toast = useToast();
  const { confirm, confirmProps } = useConfirm();

  const handleToggle = async (item) => {
    try {
      await teacherService.toggleStatus(item._id);
      list.refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (item) => {
    const ok = await confirm({
      title: 'Delete teacher',
      message: t('{name} will be permanently removed, including the photo.', { name: item.name }),
      confirmLabel: 'Delete'
    });
    if (!ok) return;
    try {
      await teacherService.remove(item._id);
      toast.success('Teacher deleted');
      list.refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Teacher',
      render: (item) => (
        <div className="flex items-center gap-3">
          <img
            src={item.image && item.image.url}
            alt=""
            className="object-cover w-10 h-10 rounded-full bg-slate-100"
          />
          <div className="min-w-0">
            <p className="font-medium truncate text-slate-900">{item.name}</p>
            <p className="text-xs truncate text-slate-500">{item.title}</p>
          </div>
        </div>
      )
    },
    {
      key: 'subjects',
      header: 'Subjects',
      render: (item) => truncate((item.subjects || []).join('، '), 40) || '—'
    },
    { key: 'rating', header: 'Rating', render: (item) => Number(item.rating).toFixed(1) },
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
          editTo={withId(ROUTES.TEACHER_EDIT, item._id)}
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
        title="Teachers"
        description="Manage the teachers shown on the website."
        action={
          <Link to={ROUTES.TEACHER_NEW} className="btn-primary">
            <Plus size={16} />
            {t('Add teacher')}
          </Link>
        }
      />
      <ListToolbar
        search={list.search}
        onSearch={list.setSearch}
        placeholder="Search by name or title"
        filter={{
          value: list.filters.isActive || '',
          onChange: (value) => list.setFilter('isActive', value),
          options: STATUS_OPTIONS
        }}
      />
      <DataTable columns={columns} rows={list.items} loading={list.loading} />
      <Pagination meta={list.meta} onChange={list.setPage} />
      <ConfirmDialog {...confirmProps} />
    </div>
  );
}