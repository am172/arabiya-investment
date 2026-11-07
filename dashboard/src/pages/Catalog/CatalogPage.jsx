import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ChevronsDownUp,
    ChevronsUpDown,
    Folder,
    Layers,
    Loader2,
    Package,
    Plus,
    Search,
    Sparkles,
    Star,
    X
} from 'lucide-react';
import catalogService from '../../services/catalog.service';
import useFetch from '../../hooks/useFetch';
import useDebounce from '../../hooks/useDebounce';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import CatalogTree, { KindChip, Thumb } from '../../components/catalog/CatalogTree';
import TreePickerModal from '../../components/catalog/TreePickerModal';
import DeleteDialog from '../../components/catalog/DeleteDialog';
import DuplicateDialog from '../../components/catalog/DuplicateDialog';
import { ROUTES, withId } from '../../constants/routes';
import { flattenTree } from '../../utils/catalog';
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
    const [filterType, setFilterType] = useState('all');
    const [busy, setBusy] = useState(false);
    const [moveTarget, setMoveTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [duplicateTarget, setDuplicateTarget] = useState(null);
    const [addProductOpen, setAddProductOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');

    const needle = useDebounce(search, 350).trim();
    const found = useFetch(
        () =>
            needle
                ? catalogService.list({ search: needle, parent: 'all', limit: 50 })
                : Promise.resolve({ data: [] }),
        [needle]
    );

    const tree = data ? data.tree : [];
    const flat = useMemo(() => flattenTree(tree), [tree]);
    const open = useMemo(() => expanded || new Set(tree.map((node) => node._id)), [expanded, tree]);

    const parentMap = useMemo(() => {
        const byId = new Map();
        const childToParent = new Map();

        const walk = (nodes, parentNode = null, pathNames = []) => {
            if (!Array.isArray(nodes)) return;
            nodes.forEach((item) => {
                if (!item || !item._id) return;
                const id = String(item._id);
                byId.set(id, item);
                if (parentNode) {
                    childToParent.set(id, {
                        parent: parentNode,
                        path: pathNames
                    });
                }
                if (Array.isArray(item.children) && item.children.length > 0) {
                    walk(item.children, item, [...pathNames, item.name]);
                }
            });
        };

        walk(tree);
        return { byId, childToParent };
    }, [tree]);

    const categoryRows = useMemo(
        () => flat.filter((row) => row.node.kind === 'category'),
        [flat]
    );

    const stats = useMemo(
        () => ({
            items: flat.length,
            categories: categoryRows.length,
            products: flat.filter((row) => row.node.kind === 'product').length,
            drafts: flat.filter((row) => !row.node.isActive).length,
            featured: flat.filter((row) => row.node.isFeatured).length
        }),
        [flat, categoryRows]
    );

    const filterCards = useMemo(
        () => [
            { id: 'all', label: 'Items', value: stats.items, icon: Layers },
            { id: 'categories', label: 'Categories', value: stats.categories, icon: Folder },
            { id: 'products', label: 'Products', value: stats.products, icon: Package },
            { id: 'drafts', label: 'Drafts', value: stats.drafts, icon: Sparkles },
            { id: 'featured', label: 'Featured', value: stats.featured, icon: Star }
        ],
        [stats]
    );

    const displayedTree = useMemo(() => {
        if (filterType === 'all') return tree;
        return flat
            .filter(({ node }) => {
                if (filterType === 'categories') return node.kind === 'category';
                if (filterType === 'products') return node.kind === 'product';
                if (filterType === 'drafts') return !node.isActive;
                if (filterType === 'featured') return Boolean(node.isFeatured);
                return true;
            })
            .map(({ node, depth, parent, siblings }) => {
                const id = String(node._id);
                const walked = parentMap.childToParent.get(id);
                let parentName = null;
                let parentPath = '';

                if (walked && walked.parent) {
                    parentName = walked.parent.name;
                    parentPath = walked.path.length > 1 ? walked.path.join(' › ') : '';
                } else if (parent && typeof parent === 'object' && parent.name) {
                    parentName = parent.name;
                } else if (node.parent) {
                    const pId = typeof node.parent === 'object' ? node.parent._id : node.parent;
                    const foundParent =
                        (typeof node.parent === 'object' && node.parent.name ? node.parent : null) ||
                        parentMap.byId.get(String(pId));
                    if (foundParent) {
                        parentName = foundParent.name;
                        const pWalked = parentMap.childToParent.get(String(foundParent._id));
                        if (pWalked && pWalked.path.length > 0) {
                            parentPath = [...pWalked.path, foundParent.name].join(' › ');
                        }
                    }
                } else if (Array.isArray(node.path) && node.path.length > 0) {
                    const names = node.path
                        .map((p) => (typeof p === 'object' ? p.name : p))
                        .filter(Boolean);
                    if (names.length > 0) {
                        parentName = names[names.length - 1];
                        parentPath = names.length > 1 ? names.join(' › ') : '';
                    }
                }

                return {
                    ...node,
                    depth,
                    parentNode: parent || (walked ? walked.parent : null),
                    parentName,
                    parentPath,
                    originalSiblings: siblings,
                    children: []
                };
            });
    }, [filterType, tree, flat, parentMap]);

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

    const openAddProductModal = (defaultParentId = '') => {
        setSelectedCategory(defaultParentId);
        setAddProductOpen(true);
    };

    const handleConfirmAddProduct = (event) => {
        event.preventDefault();
        setAddProductOpen(false);
        const query = selectedCategory
            ? `?kind=product&parent=${encodeURIComponent(selectedCategory)}`
            : '?kind=product';
        navigate(`${ROUTES.CATALOG_NEW}${query}`);
    };

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
        else if (action === 'delete')
            setDeleteTarget({ ids: [node._id], name: node.name, childrenCount: node.childrenCount });
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
                : await run(
                      () => catalogService.bulk({ ids, action: 'delete', strategy }),
                      'Bulk action completed'
                  );
        if (res) {
            setDeleteTarget(null);
            setSelected(new Set());
        }
    };

    const confirmDuplicate = async (options) => {
        const res = await run(
            () => catalogService.duplicate(duplicateTarget._id, options),
            'Item duplicated successfully'
        );
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
        <div className="space-y-5">
            <PageHeader
                title="Products & categories"
                description="Build and organise your catalog. Drag items to reorder or nest them, and edit anything without a developer."
                action={
                    <div className="flex flex-wrap items-center gap-2.5">
                        <Link to={`${ROUTES.CATALOG_NEW}?kind=category`} className="btn-secondary">
                            <Folder size={16} />
                            {t('Add category')}
                        </Link>
                        <button
                            type="button"
                            onClick={() => openAddProductModal('')}
                            className="btn-primary"
                        >
                            <Plus size={16} />
                            {t('Add product')}
                        </button>
                    </div>
                }
            />

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {filterCards.map(({ id, label, value, icon: Icon }) => {
                    const isActive = filterType === id;
                    const isFeaturedCard = id === 'featured';
                    return (
                        <button
                            key={id}
                            type="button"
                            aria-pressed={isActive}
                            onClick={() => setFilterType(id)}
                            className={`flex items-center justify-between rounded-2xl border p-4 text-start transition ${
                                isActive
                                    ? isFeaturedCard
                                        ? 'border-amber-400 bg-amber-500/10 text-amber-500 ring-1 ring-amber-400/30'
                                        : 'border-primary bg-primary/10 text-primary ring-1 ring-primary/30'
                                    : 'border-border bg-surface text-foreground hover:bg-foreground/5'
                            }`}
                        >
                            <div>
                                <p className="text-2xl font-bold text-foreground">{value}</p>
                                <p
                                    className={`mt-0.5 text-xs font-medium ${
                                        isActive
                                            ? isFeaturedCard
                                                ? 'text-amber-500'
                                                : 'text-primary'
                                            : 'text-muted'
                                    }`}
                                >
                                    {t(label)}
                                </p>
                            </div>
                            <span
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
                                    isActive
                                        ? isFeaturedCard
                                            ? 'bg-amber-400 text-slate-950'
                                            : 'bg-primary text-background'
                                        : isFeaturedCard
                                          ? 'bg-amber-500/10 text-amber-500'
                                          : 'bg-background text-muted'
                                }`}
                            >
                                <Icon
                                    size={18}
                                    className={isFeaturedCard ? 'fill-current' : ''}
                                />
                            </span>
                        </button>
                    );
                })}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search size={16} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                        className="input ps-10"
                        placeholder={t('Search all items...')}
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                </div>
                {!needle && filterType === 'all' && (
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() =>
                                persist(
                                    new Set(
                                        flat
                                            .filter((row) => row.node.children.length > 0)
                                            .map((row) => row.node._id)
                                    )
                                )
                            }
                        >
                            <ChevronsUpDown size={16} />
                            {t('Expand all')}
                        </button>
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => persist(new Set())}
                        >
                            <ChevronsDownUp size={16} />
                            {t('Collapse all')}
                        </button>
                    </div>
                )}
                {filterType !== 'all' && (
                    <button
                        type="button"
                        onClick={() => setFilterType('all')}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-foreground/5"
                    >
                        <X size={14} />
                        {t('Items')}
                    </button>
                )}
            </div>

            {selected.size > 0 && (
                <div className="sticky top-2 z-20 flex flex-wrap items-center gap-2 rounded-2xl border border-primary/30 bg-surface px-4 py-3 shadow-sm">
                    <span className="me-2 rounded-lg bg-primary/10 px-2.5 py-1 text-sm font-semibold text-primary">
                        {t('{n} selected', { n: selected.size })}
                    </span>
                    {BULK.map((item) => (
                        <button
                            key={item.action}
                            type="button"
                            className="btn-secondary px-3 py-1.5 text-xs"
                            disabled={busy}
                            onClick={() => bulk(item.action)}
                        >
                            {t(item.label)}
                        </button>
                    ))}
                    <button
                        type="button"
                        className="btn-secondary px-3 py-1.5 text-xs"
                        disabled={busy}
                        onClick={() => setMoveTarget({ ids: [...selected] })}
                    >
                        {t('Move to...')}
                    </button>
                    <button
                        type="button"
                        className="btn-danger px-3 py-1.5 text-xs"
                        disabled={busy}
                        onClick={() =>
                            setDeleteTarget({
                                ids: [...selected],
                                name: '',
                                childrenCount: selectedChildren
                            })
                        }
                    >
                        {t('Delete')}
                    </button>
                    <button
                        type="button"
                        className="icon-btn ms-auto text-muted hover:bg-foreground/5 hover:text-foreground"
                        aria-label={t('Clear')}
                        onClick={() => setSelected(new Set())}
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {needle ? (
                found.loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="animate-spin text-primary" />
                    </div>
                ) : found.data && found.data.length > 0 ? (
                    <ul className="space-y-2">
                        {found.data.map((item) => (
                            <li key={item._id}>
                                <Link
                                    to={withId(ROUTES.CATALOG_EDIT, item._id)}
                                    className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3.5 py-2.5 transition hover:border-primary/50 hover:bg-foreground/5"
                                >
                                    <Thumb node={item} />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-foreground">
                                            {item.name}
                                        </p>
                                        <p className="truncate text-xs text-muted">
                                            {(item.path || []).join(' › ') || t('Top level')}
                                        </p>
                                    </div>
                                    {item.isFeatured && (
                                        <Star size={15} className="fill-amber-400 text-amber-500" />
                                    )}
                                    <KindChip kind={item.kind} />
                                    {!item.isActive && (
                                        <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[11px] font-semibold text-muted">
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
            ) : displayedTree.length === 0 ? (
                <EmptyState
                    icon={Package}
                    title="No items yet"
                    description="Start by adding your first category, then add products inside it."
                    action={
                        <div className="flex gap-3">
                            <Link to={`${ROUTES.CATALOG_NEW}?kind=category`} className="btn-secondary">
                                {t('Add category')}
                            </Link>
                            <button
                                type="button"
                                onClick={() => openAddProductModal('')}
                                className="btn-primary"
                            >
                                {t('Add product')}
                            </button>
                        </div>
                    }
                />
            ) : (
                <CatalogTree
                    tree={displayedTree}
                    fullTree={tree}
                    filterType={filterType}
                    open={open}
                    isFiltered={filterType !== 'all'}
                    onToggle={toggleOpen}
                    selected={selected}
                    onSelect={toggleSelect}
                    onMoveNode={handleTreeMove}
                    onFlags={handleFlags}
                    onAction={handleAction}
                />
            )}

            {addProductOpen && (
                <Modal
                    open
                    onClose={() => setAddProductOpen(false)}
                    title={t('Add product')}
                    size="md"
                >
                    <form onSubmit={handleConfirmAddProduct} className="space-y-4">
                        <div className="space-y-1.5">
                            <label
                                htmlFor="product-category-select"
                                className="block text-sm font-semibold text-foreground"
                            >
                                {t('Category')}
                            </label>
                            <select
                                id="product-category-select"
                                value={selectedCategory}
                                onChange={(event) => setSelectedCategory(event.target.value)}
                                className="input w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                            >
                                <option value="">{t('Top level')}</option>
                                {categoryRows.map(({ node, depth }) => (
                                    <option key={node._id} value={node._id}>
                                        {`${'— '.repeat(depth)}${node.name}`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex justify-end gap-2.5 pt-2">
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => setAddProductOpen(false)}
                            >
                                {t('Cancel')}
                            </button>
                            <button type="submit" className="btn-primary">
                                <Plus size={16} />
                                {t('Add product')}
                            </button>
                        </div>
                    </form>
                </Modal>
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