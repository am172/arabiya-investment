import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronsDownUp, ChevronsUpDown, Folder, Loader2, Package, Plus, Search, Star, X } from 'lucide-react';
import catalogService from '../../services/catalog.service';
import useFetch from '../../hooks/useFetch';
import useDebounce from '../../hooks/useDebounce';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import CatalogTree, { KindChip, Thumb } from '../../components/catalog/CatalogTree';
import TreePickerModal from '../../components/catalog/TreePickerModal';
import DeleteDialog from '../../components/catalog/DeleteDialog';
import DuplicateDialog from '../../components/catalog/DuplicateDialog';
import { ROUTES, withId } from '../../constants/routes';
import { flattenTree, siblingsOf } from '../../utils/catalog';
import { t } from '../../i18n';

const STORE = 'catalog_expanded';

const readExpanded = () => {
    try {
        const stored = JSON.parse(localStorage.getItem(STORE));
        return Array.isArray(stored) ? new Set(stored) : null;
    } catch (error) {
        return null;
    }
};

const BULK = [
    { action: 'activate', label: 'Publish' },
    { action: 'deactivate', label: 'Unpublish' },
    { action: 'feature', label: 'Feature' },
    { action: 'unfeature', label: 'Unfeature' },
    { action: 'enableRequests', label: 'Enable requests' },
    { action: 'disableRequests', label: 'Disable requests' }
];

export default function CatalogPage() {
    const navigate = useNavigate();
    const toast = useToast();
    const { data, loading, error, refetch } = useFetch(() => catalogService.tree(), []);
    const [expanded, setExpanded] = useState(readExpanded);
    const [selected, setSelected] = useState(new Set());
    const [search, setSearch] = useState('');
    const [busy, setBusy] = useState(false);
    const [moveTarget, setMoveTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [duplicateTarget, setDuplicateTarget] = useState(null);

    const needle = useDebounce(search, 350).trim();
    const found = useFetch(
        () => (needle ? catalogService.list({ search: needle, parent: 'all', limit: 50 }) : Promise.resolve({ data: [] })),
        [needle]
    );

    const tree = data ? data.tree : [];
    const flat = useMemo(() => flattenTree(tree), [tree]);
    const open = useMemo(() => expanded || new Set(tree.map((node) => node._id)), [expanded, tree]);

    const stats = useMemo(
        () => ({
            items: flat.length,
            categories: flat.filter((row) => row.node.kind === 'category').length,
            products: flat.filter((row) => row.node.kind === 'product').length,
            drafts: flat.filter((row) => !row.node.isActive).length,
            featured: flat.filter((row) => row.node.isFeatured).length
        }),
        [flat]
    );

    const persist = (next) => {
        setExpanded(next);
        try {
            localStorage.setItem(STORE, JSON.stringify([...next]));
        } catch (error) {
            return;
        }
    };

    const toggleOpen = (id) => {
        const next = new Set(open);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        persist(next);
    };

    const toggleSelect = (id) =>
        setSelected((current) => {
            const next = new Set(current);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });

    const run = async (action, success) => {
        setBusy(true);
        try {
            const res = await action();
            if (success) toast.success(success);
            refetch();
            return res;
        } catch (err) {
            toast.error(err.message);
            return null;
        } finally {
            setBusy(false);
        }
    };

    const handleFlags = (node, flags) => run(() => catalogService.setFlags(node._id, flags));

    const handleTreeMove = (dragId, row, zone) => {
        let parent;
        let index;

        if (zone === 'inside') {
            parent = row.node._id;
            persist(new Set([...open, row.node._id]));
        } else {
            parent = row.node.parent || null;
            const ids = row.siblings.map((sibling) => sibling._id).filter((id) => id !== dragId);
            index = ids.indexOf(row.node._id) + (zone === 'after' ? 1 : 0);
        }

        run(() => catalogService.move(dragId, parent, index), 'Item moved successfully');
    };

    const reorderBy = (row, delta) => {
        const ids = row.siblings.map((sibling) => sibling._id);
        const from = ids.indexOf(row.node._id);
        const to = from + delta;
        if (to < 0 || to >= ids.length) return;
        [ids[from], ids[to]] = [ids[to], ids[from]];
        run(() => catalogService.reorder(row.node.parent || null, ids), 'Order saved successfully');
    };

    const handleAction = (action, row) => {
        const node = row.node;
        if (action === 'addCategory') navigate(`${ROUTES.CATALOG_NEW}?kind=category&parent=${node._id}`);
        else if (action === 'addProduct') navigate(`${ROUTES.CATALOG_NEW}?kind=product&parent=${node._id}`);
        else if (action === 'duplicate') setDuplicateTarget(node);
        else if (action === 'move') setMoveTarget({ ids: [node._id] });
        else if (action === 'up') reorderBy(row, -1);
        else if (action === 'down') reorderBy(row, 1);
        else if (action === 'delete') setDeleteTarget({ ids: [node._id], name: node.name, childrenCount: node.childrenCount });
    };

    const confirmMove = async (parent) => {
        const ids = moveTarget.ids;
        setMoveTarget(null);
        if (ids.length === 1) await run(() => catalogService.move(ids[0], parent), 'Item moved successfully');
        else await bulk('move', { parent });
    };

    const confirmDelete = async (strategy) => {
        const { ids } = deleteTarget;
        const res =
            ids.length === 1
                ? await run(() => catalogService.remove(ids[0], strategy), 'Item deleted successfully')
                : await run(() => catalogService.bulk({ ids, action: 'delete', strategy }), 'Bulk action completed');
        if (res) {
            setDeleteTarget(null);
            setSelected(new Set());
        }
    };

    const confirmDuplicate = async (options) => {
        const res = await run(() => catalogService.duplicate(duplicateTarget._id, options), 'Item duplicated successfully');
        if (res) {
            setDuplicateTarget(null);
            navigate(withId(ROUTES.CATALOG_EDIT, res.data._id));
        }
    };

    async function bulk(action, extra = {}) {
        setBusy(true);
        try {
            const res = await catalogService.bulk({ ids: [...selected], action, ...extra });
            const failed = res.data.failed.length;
            if (failed > 0) toast.error(t('{n} item(s) could not be processed', { n: failed }));
            else toast.success('Bulk action completed');
            setSelected(new Set());
            refetch();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setBusy(false);
        }
    }

    const selectedNodes = flat.filter((row) => selected.has(row.node._id)).map((row) => row.node);
    const selectedChildren = selectedNodes.reduce((sum, node) => sum + node.childrenCount, 0);

    if (loading && !data) return <Loader />;
    if (error || !data) return <EmptyState title="Could not load the catalog" description={error} />;

    return (
        <div>
            <PageHeader
                title="Products & categories"
                description="Build and organise your catalog. Drag items to reorder or nest them, and edit anything without a developer."
                action={
                    <div className="flex flex-wrap gap-3">
                        <Link to={`${ROUTES.CATALOG_NEW}?kind=category`} className="btn-secondary">
                            <Folder size={16} />
                            {t('Add category')}
                        </Link>
                        <Link to={`${ROUTES.CATALOG_NEW}?kind=product`} className="btn-primary">
                            <Plus size={16} />
                            {t('Add product')}
                        </Link>
                    </div>
                }
            />

            <div className="grid grid-cols-2 gap-3 mb-4 sm:grid-cols-5">
                {[
                    ['Items', stats.items],
                    ['Categories', stats.categories],
                    ['Products', stats.products],
                    ['Drafts', stats.drafts],
                    ['Featured', stats.featured]
                ].map(([label, value]) => (
                    <div key={label} className="px-4 py-3 card">
                        <p className="text-2xl font-bold text-slate-900">{value}</p>
                        <p className="text-xs text-slate-500">{t(label)}</p>
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search size={16} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        className="input ps-10"
                        placeholder={t('Search all items...')}
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                </div>
                {!needle && (
                    <div className="flex gap-2">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => persist(new Set(flat.filter((row) => row.node.children.length > 0).map((row) => row.node._id)))}
                        >
                            <ChevronsUpDown size={16} />
                            {t('Expand all')}
                        </button>
                        <button type="button" className="btn-secondary" onClick={() => persist(new Set())}>
                            <ChevronsDownUp size={16} />
                            {t('Collapse all')}
                        </button>
                    </div>
                )}
            </div>

            {selected.size > 0 && (
                <div className="sticky z-20 flex flex-wrap items-center gap-2 px-4 py-3 mb-4 border shadow-sm top-2 rounded-2xl border-brand-200 bg-brand-50">
                    <span className="text-sm font-semibold me-2 text-brand-700">{t('{n} selected', { n: selected.size })}</span>
                    {BULK.map((item) => (
                        <button key={item.action} type="button" className="btn-secondary px-3 py-1.5 text-xs" disabled={busy} onClick={() => bulk(item.action)}>
                            {t(item.label)}
                        </button>
                    ))}
                    <button type="button" className="btn-secondary px-3 py-1.5 text-xs" disabled={busy} onClick={() => setMoveTarget({ ids: [...selected] })}>
                        {t('Move to...')}
                    </button>
                    <button
                        type="button"
                        className="btn-danger px-3 py-1.5 text-xs"
                        disabled={busy}
                        onClick={() => setDeleteTarget({ ids: [...selected], name: '', childrenCount: selectedChildren })}
                    >
                        {t('Delete')}
                    </button>
                    <button type="button" className="icon-btn ms-auto" aria-label={t('Clear')} onClick={() => setSelected(new Set())}>
                        <X size={16} />
                    </button>
                </div>
            )}

            {needle ? (
                found.loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="animate-spin text-brand-600" />
                    </div>
                ) : found.data && found.data.length > 0 ? (
                    <ul className="space-y-1.5">
                        {found.data.map((item) => (
                            <li key={item._id}>
                                <Link
                                    to={withId(ROUTES.CATALOG_EDIT, item._id)}
                                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-card px-3 py-2.5 transition hover:border-brand-400"
                                >
                                    <Thumb node={item} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold truncate text-slate-900">{item.name}</p>
                                        <p className="text-xs truncate text-slate-500">{(item.path || []).join(' › ') || t('Top level')}</p>
                                    </div>
                                    {item.isFeatured && <Star size={15} className="fill-amber-400 text-amber-500" />}
                                    <KindChip kind={item.kind} />
                                    {!item.isActive && (
                                        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                                            {t('Draft')}
                                        </span>
                                    )}
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <EmptyState title="No matching items" icon={Search} />
                )
            ) : tree.length === 0 ? (
                <EmptyState
                    icon={Package}
                    title="No items yet"
                    description="Start by adding your first category, then add products inside it."
                    action={
                        <div className="flex gap-3">
                            <Link to={`${ROUTES.CATALOG_NEW}?kind=category`} className="btn-secondary">
                                {t('Add category')}
                            </Link>
                            <Link to={`${ROUTES.CATALOG_NEW}?kind=product`} className="btn-primary">
                                {t('Add product')}
                            </Link>
                        </div>
                    }
                />
            ) : (
                <CatalogTree
                    tree={tree}
                    open={open}
                    onToggle={toggleOpen}
                    selected={selected}
                    onSelect={toggleSelect}
                    onMoveNode={handleTreeMove}
                    onFlags={handleFlags}
                    onAction={handleAction}
                />
            )}

            {moveTarget && (
                <TreePickerModal
                    title="Move item"
                    confirmLabel="Move here"
                    allowRoot
                    excludeIds={moveTarget.ids}
                    onPick={confirmMove}
                    onClose={() => setMoveTarget(null)}
                />
            )}
            {deleteTarget && (
                <DeleteDialog
                    name={deleteTarget.name}
                    itemCount={deleteTarget.ids.length}
                    childrenCount={deleteTarget.childrenCount}
                    busy={busy}
                    onConfirm={confirmDelete}
                    onClose={() => setDeleteTarget(null)}
                />
            )}
            {duplicateTarget && (
                <DuplicateDialog
                    hasChildren={duplicateTarget.childrenCount > 0}
                    busy={busy}
                    onConfirm={confirmDuplicate}
                    onClose={() => setDuplicateTarget(null)}
                />
            )}
        </div>
    );
}