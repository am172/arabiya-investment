import { Link } from 'react-router-dom';
import { Crown, Plus } from 'lucide-react';
import packageService from '../../services/package.service';
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
import { formatCurrency } from '../../utils/formatters';
import { t } from '../../i18n';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' }
];

const PERIODS = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
  'one-time': 'One-time'
};

export default function PackagesListPage() {
  const list = useResourceList(packageService);
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
      title: 'Delete package',
      message: t('The "{name}" package will be permanently removed.', { name: item.name }),
      confirmLabel: 'Delete'
    });
    if (ok) run(() => packageService.remove(item._id), 'Package deleted');
  };

  const columns = [
    {
      key: 'name',
      header: 'Package',
      render: (item) => (
        <div>
          <p className="font-medium text-slate-900">{item.name}</p>
          {item.badge && <p className="text-xs text-slate-500">{item.badge}</p>}
        </div>
      )
    },
    {
      key: 'price',
      header: 'Price',
      render: (item) =>
        item.discountPrice !== null && item.discountPrice !== undefined ? (
          <div>
            <span className="font-semibold text-slate-900">
              {formatCurrency(item.discountPrice, item.currency)}
            </span>
            <span className="text-xs line-through ms-2 text-slate-400">
              {formatCurrency(item.price, item.currency)}
            </span>
          </div>
        ) : (
          <span className="font-semibold text-slate-900">{formatCurrency(item.price, item.currency)}</span>
        )
    },
    {
      key: 'billingPeriod',
      header: 'Billing',
      render: (item) => t(PERIODS[item.billingPeriod] || item.billingPeriod)
    },
    { key: 'sessionsPerMonth', header: 'Sessions' },
    {
      key: 'isPopular',
      header: 'Popular',
      render: (item) => (item.isPopular ? <StatusBadge status="popular" /> : '—')
    },
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
          editTo={withId(ROUTES.PACKAGE_EDIT, item._id)}
          isActive={item.isActive}
          onToggle={() => run(() => packageService.toggleStatus(item._id))}
          onDelete={() => handleDelete(item)}
        >
          {!item.isPopular && (
            <button
              type="button"
              className="icon-btn"
              title={t('Set as popular')}
              onClick={() => run(() => packageService.setPopular(item._id), 'Package updated')}
            >
              <Crown size={16} />
            </button>
          )}
        </RowActions>
      )
    }
  ];

  return (
    <div>
      <PageHeader
        title="Packages"
        description="Pricing plans displayed on the landing page."
        action={
          <Link to={ROUTES.PACKAGE_NEW} className="btn-primary">
            <Plus size={16} />
            {t('Add package')}
          </Link>
        }
      />
      <ListToolbar
        search={list.search}
        onSearch={list.setSearch}
        placeholder="Search packages"
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