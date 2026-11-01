import { Link } from 'react-router-dom';
import { Film, Plus, Star } from 'lucide-react';
import videoService from '../../services/video.service';
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
import { t } from '../../i18n';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' }
];

export default function VideosListPage() {
  const list = useResourceList(videoService);
  const toast = useToast();
  const { confirm, confirmProps } = useConfirm();

  const run = async (action, successMessage) => {
    try {
      await action();
      if (successMessage) toast.success(successMessage);
      list.refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (item) => {
    const ok = await confirm({
      title: 'Delete video',
      message: t('"{title}" and its uploaded files will be permanently removed.', { title: item.title }),
      confirmLabel: 'Delete'
    });
    if (ok) run(() => videoService.remove(item._id), 'Video deleted');
  };

  const columns = [
    {
      key: 'title',
      header: 'Video',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-20 h-12 overflow-hidden rounded-lg shrink-0 bg-slate-100 text-slate-400">
            {item.thumbnail && item.thumbnail.url ? (
              <img src={item.thumbnail.url} alt="" className="object-cover w-full h-full" />
            ) : (
              <Film size={18} />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium truncate text-slate-900">{item.title}</p>
            <p className="text-xs truncate text-slate-500">
              {item.studentName || '—'}
              {item.studentAge ? ` · ${t('{age} yrs', { age: item.studentAge })}` : ''}
            </p>
          </div>
        </div>
      )
    },
    { key: 'source', header: 'Source', render: (item) => <StatusBadge status={item.source} /> },
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
          editTo={withId(ROUTES.VIDEO_EDIT, item._id)}
          isActive={item.isActive}
          onToggle={() => run(() => videoService.toggleStatus(item._id))}
          onDelete={() => handleDelete(item)}
        >
          <button
            type="button"
            className="icon-btn"
            title={item.isFeatured ? t('Remove from featured') : t('Mark as featured')}
            onClick={() => run(() => videoService.toggleFeatured(item._id))}
          >
            <Star size={16} className={item.isFeatured ? 'fill-amber-400 text-amber-500' : ''} />
          </button>
        </RowActions>
      )
    }
  ];

  return (
    <div>
      <PageHeader
        title="Student videos"
        description="Testimonials and student showcases shown on the landing page."
        action={
          <Link to={ROUTES.VIDEO_NEW} className="btn-primary">
            <Plus size={16} />
            {t('Add video')}
          </Link>
        }
      />
      <ListToolbar
        search={list.search}
        onSearch={list.setSearch}
        placeholder="Search by title or student"
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