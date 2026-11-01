import { Link } from 'react-router-dom';
import { Boxes, ClipboardList, Folder, Mail, Package, Palette, Plus } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useFetch from '../../hooks/useFetch';
import catalogService from '../../services/catalog.service';
import requestService from '../../services/request.service';
import messageService from '../../services/message.service';
import EmptyState from '../../components/common/EmptyState';
import PageHeader from '../../components/common/PageHeader';
import RequestStatusBadge from '../../components/requests/RequestStatusBadge';
import OverviewSkeleton from './OverviewSkeleton';
import { ROUTES } from '../../constants/routes';
import { flattenTree } from '../../utils/catalog';
import { formatDateTime, formatNumber } from '../../utils/formatters';
import { t } from '../../i18n';

const load = async () => {
  const [tree, stats, recent, messages] = await Promise.all([
    catalogService.tree(),
    requestService.stats(),
    requestService.list({ page: 1, limit: 5 }),
    messageService.unreadCount().catch(() => ({ data: { count: 0 } }))
  ]);
  return { data: { tree: tree.data.tree, stats: stats.data, recent: recent.data, messages: messages.data.count } };
};

export default function OverviewPage() {
  const { admin } = useAuth();
  const { data, loading, error } = useFetch(load, []);

  if (loading && !data) return <OverviewSkeleton />;
  if (error || !data) return <EmptyState title="Could not load overview" description={error} />;

  const flat = flattenTree(data.tree);
  const products = flat.filter((row) => row.node.kind === 'product');
  const categories = flat.filter((row) => row.node.kind === 'category');

  const cards = [
    {
      label: 'Products',
      value: products.length,
      sub: t('{n} published', { n: products.filter((row) => row.node.isActive).length }),
      icon: Package,
      to: ROUTES.CATALOG,
      tone: 'bg-indigo-50 text-indigo-600'
    },
    {
      label: 'Categories',
      value: categories.length,
      sub: t('{n} published', { n: categories.filter((row) => row.node.isActive).length }),
      icon: Folder,
      to: ROUTES.CATALOG,
      tone: 'bg-amber-50 text-amber-600'
    },
    {
      label: 'New requests',
      value: data.stats.unread,
      sub: t('{n} in the last 7 days', { n: data.stats.lastWeek }),
      icon: ClipboardList,
      to: ROUTES.REQUESTS,
      tone: 'bg-rose-50 text-rose-600'
    },
    {
      label: 'Unread messages',
      value: data.messages,
      sub: t('From the contact form'),
      icon: Mail,
      to: ROUTES.MESSAGES,
      tone: 'bg-sky-50 text-sky-600'
    }
  ];

  const shortcuts = [
    { label: 'Add product', icon: Plus, to: `${ROUTES.CATALOG_NEW}?kind=product` },
    { label: 'Add category', icon: Folder, to: `${ROUTES.CATALOG_NEW}?kind=category` },
    { label: 'Option templates', icon: Boxes, to: ROUTES.OPTION_TEMPLATES },
    { label: 'Change theme', icon: Palette, to: ROUTES.THEME }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('Hello, {name}', { name: admin.name.split(' ')[0] })}
        description="Here is what is happening on your website."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, sub, icon: Icon, to, tone }) => (
          <Link key={label} to={to} className="p-5 transition card hover:shadow-md">
            <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}>
              <Icon size={22} />
            </div>
            <p className="text-3xl font-bold text-slate-900">{formatNumber(value)}</p>
            <p className="mt-1 text-sm font-medium text-slate-700">{t(label)}</p>
            <p className="text-xs text-slate-500">{sub}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">{t('Recent requests')}</h3>
            <Link to={ROUTES.REQUESTS} className="text-sm font-medium text-brand-600 hover:underline">
              {t('View all')}
            </Link>
          </div>
          {data.recent.length === 0 ? (
            <p className="px-5 py-10 text-sm text-center text-slate-500">{t('No requests yet')}</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.recent.map((item) => (
                <li key={item._id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                  <div className="min-w-0">
                    <p dir="auto" className="text-sm font-semibold truncate text-slate-800">
                      {item.name}
                    </p>
                    <p dir="auto" className="text-xs truncate text-slate-500">
                      {item.items[0] ? item.items[0].productName : item.reference}
                    </p>
                  </div>
                  <div className="shrink-0 text-end">
                    <RequestStatusBadge status={item.status} />
                    <p className="mt-1 text-xs text-slate-400">{formatDateTime(item.createdAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-5 card">
          <h3 className="mb-4 font-semibold text-slate-900">{t('Quick actions')}</h3>
          <div className="space-y-2">
            {shortcuts.map(({ label, icon: Icon, to }) => (
              <Link
                key={label}
                to={to}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium transition border rounded-xl border-slate-200 text-slate-700 hover:border-brand-300 hover:bg-brand-50"
              >
                <Icon size={18} className="text-brand-600" />
                {t(label)}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}