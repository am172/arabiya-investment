import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowDown,
    ArrowUp,
    ChevronDown,
    ClipboardList,
    Copy,
    Folder,
    FolderInput,
    GripVertical,
    MoreHorizontal,
    Package,
    Pencil,
    Star,
    Trash2
} from 'lucide-react';
import Switch from '../common/Switch';
import { ROUTES, withId } from '../../constants/routes';
import { collectIds, thumb } from '../../utils/catalog';
import { t } from '../../i18n';

const MENU = [
    { id: 'addCategory', label: 'Add category inside', icon: Folder },
    { id: 'addProduct', label: 'Add product inside', icon: Package },
    { id: 'toggleRequests', label: 'Enable requests', icon: ClipboardList },
    { id: 'duplicate', label: 'Duplicate', icon: Copy },
    { id: 'move', label: 'Move to...', icon: FolderInput },
    { id: 'up', label: 'Move up', icon: ArrowUp },
    { id: 'down', label: 'Move down', icon: ArrowDown },
    { id: 'delete', label: 'Delete', icon: Trash2, danger: true }
];

export function Thumb({ node }) {
    const Icon = node.kind === 'category' ? Folder : Package;
    return node.cover && node.cover.url ? (
        <img
            src={thumb(node.cover.url, 96)}
            alt=""
            className="h-10 w-10 shrink-0 rounded-xl border border-border bg-background object-cover"
        />
    ) : (
        <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                node.kind === 'category'
                    ? 'border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                    : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            }`}
        >
            <Icon size={18} />
        </span>
    );
}

export function KindChip({ kind }) {
    const Icon = kind === 'category' ? Folder : Package;
    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                kind === 'category'
                    ? 'border border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                    : 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            }`}
        >
            <Icon size={11} />
            {t(kind === 'category' ? 'Category' : 'Product')}
        </span>
    );
}

function RowMenu({ items, onSelect, onOpenChange }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const changeOpen = (next) => {
        const value = typeof next === 'function' ? next(open) : next;
        setOpen(value);
        if (onOpenChange) onOpenChange(value);
    };

    useEffect(() => {
        if (!open) return undefined;
        const onDown = (event) => {
            if (ref.current && !ref.current.contains(event.target)) changeOpen(false);
        };
        const onKey = (event) => {
            if (event.key === 'Escape') changeOpen(false);
        };
        document.addEventListener('mousedown', onDown);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onDown);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                className="icon-btn flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-foreground/5 hover:text-foreground"
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label={t('More actions')}
                onClick={() => changeOpen((value) => !value)}
            >
                <MoreHorizontal size={16} />
            </button>
            {open && (
                <ul
                    role="menu"
                    className="absolute end-0 top-full z-50 mt-1.5 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
                >
                    {items.map((item) => {
                        const Icon = item.icon;
                        return (
                            <li key={item.id}>
                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => {
                                        changeOpen(false);
                                        onSelect(item.id);
                                    }}
                                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-start text-sm transition hover:bg-slate-100 dark:hover:bg-zinc-800 ${
                                        item.danger
                                            ? 'font-medium text-rose-600 dark:text-rose-400'
                                            : 'text-slate-700 dark:text-zinc-100'
                                    }`}
                                >
                                    <Icon
                                        size={15}
                                        className={`shrink-0 ${
                                            item.danger
                                                ? 'text-rose-500 dark:text-rose-400'
                                                : 'text-slate-400 dark:text-zinc-400'
                                        }`}
                                    />
                                    <span className="truncate">{t(item.label)}</span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

export default function CatalogTree({
    tree,
    fullTree = [],
    filterType = 'all',
    open,
    isFiltered = false,
    onToggle,
    selected,
    onSelect,
    onMoveNode,
    onFlags,
    onAction
}) {
    const [drag, setDrag] = useState({ id: null, forbidden: new Set() });
    const [over, setOver] = useState({ id: null, zone: null });
    const [openMenuId, setOpenMenuId] = useState(null);

    const lookup = useMemo(() => {
        const byId = new Map();
        const parentByChild = new Map();

        const walk = (nodes, parentNode = null, pathNames = []) => {
            if (!Array.isArray(nodes)) return;
            nodes.forEach((item) => {
                if (!item || !item._id) return;
                const id = String(item._id);
                byId.set(id, item);
                if (parentNode) {
                    parentByChild.set(id, {
                        parent: parentNode,
                        path: pathNames
                    });
                }
                if (Array.isArray(item.children) && item.children.length > 0) {
                    walk(item.children, item, [...pathNames, item.name]);
                }
            });
        };

        walk(fullTree.length > 0 ? fullTree : tree);
        return { byId, parentByChild };
    }, [fullTree, tree]);

    const getParentDisplay = (node) => {
        if (node.parentName) {
            return {
                name: node.parentName,
                path: node.parentPath || ''
            };
        }

        const id = String(node._id);
        const fromWalk = lookup.parentByChild.get(id);
        if (fromWalk && fromWalk.parent) {
            return {
                name: fromWalk.parent.name,
                path: fromWalk.path.length > 1 ? fromWalk.path.join(' › ') : ''
            };
        }

        const rawParent = node.parent || node.category;
        if (rawParent) {
            if (typeof rawParent === 'object' && rawParent.name) {
                return { name: rawParent.name, path: '' };
            }
            const foundParent = lookup.byId.get(String(rawParent));
            if (foundParent) {
                const parentWalk = lookup.parentByChild.get(String(foundParent._id));
                const fullPath = parentWalk ? [...parentWalk.path, foundParent.name] : [];
                return {
                    name: foundParent.name,
                    path: fullPath.length > 1 ? fullPath.join(' › ') : ''
                };
            }
        }

        if (Array.isArray(node.path) && node.path.length > 0) {
            const names = node.path
                .map((item) => (typeof item === 'object' ? item.name : item))
                .filter(Boolean);
            if (names.length > 0) {
                return {
                    name: names[names.length - 1],
                    path: names.length > 1 ? names.join(' › ') : ''
                };
            }
        }

        return { name: null, path: '' };
    };

    const reset = () => {
        setDrag({ id: null, forbidden: new Set() });
        setOver({ id: null, zone: null });
    };

    const zoneOf = (event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const ratio = (event.clientY - rect.top) / rect.height;
        if (ratio < 0.28) return 'before';
        if (ratio > 0.72) return 'after';
        return 'inside';
    };

    const getMenuItems = (node, index, length) =>
        MENU.filter(
            (item) =>
                !(item.id === 'up' && index === 0) &&
                !(item.id === 'down' && index === length - 1)
        ).map((item) =>
            item.id === 'toggleRequests'
                ? {
                      ...item,
                      label: node.allowOrderRequest ? 'Disable requests' : 'Enable requests'
                  }
                : item
        );

    if (isFiltered) {
        const isCategoriesOnly = filterType === 'categories';
        const isProductsOnly = filterType === 'products';
        const showTypeColumn = !isCategoriesOnly && !isProductsOnly;

        const firstColTitle = isCategoriesOnly
            ? 'القسم'
            : isProductsOnly
              ? 'المنتج'
              : 'العنصر';

        const parentColTitle = isCategoriesOnly ? 'القسم الأب' : 'القسم التابع له';

        return (
            <div className="overflow-visible rounded-2xl border border-border bg-surface shadow-sm">
                <div className="overflow-x-auto overflow-y-visible">
                    <table className="w-full border-collapse text-start text-sm">
                        <thead>
                            <tr className="border-b border-border bg-background/60 text-xs font-semibold text-muted">
                                <th className="w-10 px-4 py-3.5 text-center" />
                                <th className="px-4 py-3.5 text-start">{firstColTitle}</th>
                                {showTypeColumn && (
                                    <th className="px-4 py-3.5 text-start">النوع</th>
                                )}
                                <th className="px-4 py-3.5 text-start">{parentColTitle}</th>
                                <th className="px-4 py-3.5 text-start">التفاصيل</th>
                                <th className="px-4 py-3.5 text-center">مميز</th>
                                <th className="px-4 py-3.5 text-center">النشر</th>
                                <th className="px-4 py-3.5 text-end">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {tree.map((node, index) => {
                                const siblings = node.originalSiblings || tree;
                                const siblingIndex = siblings.findIndex((s) => s._id === node._id);
                                const effectiveIndex = siblingIndex !== -1 ? siblingIndex : index;
                                const row = {
                                    node,
                                    depth: node.depth || 0,
                                    siblings,
                                    parent: node.parentNode || null
                                };
                                const items = getMenuItems(node, effectiveIndex, siblings.length);
                                const parentInfo = getParentDisplay(node);
                                const isMenuOpen = openMenuId === node._id;

                                return (
                                    <tr
                                        key={node._id}
                                        className={`transition-colors ${
                                            isMenuOpen ? 'relative z-40' : 'relative z-0'
                                        } ${
                                            selected.has(node._id)
                                                ? 'bg-primary/5'
                                                : node.isActive
                                                  ? 'hover:bg-foreground/[0.02]'
                                                  : 'bg-background/40'
                                        }`}
                                    >
                                        <td className="px-4 py-3 text-center">
                                            <input
                                                type="checkbox"
                                                aria-label={node.name}
                                                checked={selected.has(node._id)}
                                                onChange={() => onSelect(node._id)}
                                                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                                            />
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <Thumb node={node} />
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <Link
                                                            to={withId(ROUTES.CATALOG_EDIT, node._id)}
                                                            className="truncate font-semibold text-foreground transition hover:text-primary"
                                                        >
                                                            {node.name}
                                                        </Link>
                                                        {!node.isActive && (
                                                            <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[11px] font-semibold text-muted">
                                                                {t('Draft')}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {showTypeColumn && (
                                            <td className="px-4 py-3">
                                                <KindChip kind={node.kind} />
                                            </td>
                                        )}

                                        <td className="px-4 py-3">
                                            {parentInfo.name ? (
                                                <div className="min-w-0">
                                                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                                                        <Folder size={12} className="shrink-0" />
                                                        <span className="truncate">{parentInfo.name}</span>
                                                    </span>
                                                    {parentInfo.path && (
                                                        <p className="mt-1 truncate text-[11px] text-muted">
                                                            {parentInfo.path}
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted">
                                                    {node.kind === 'category' ? 'قسم رئيسي' : 'بدون قسم'}
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-4 py-3">
                                            {node.kind === 'category' ? (
                                                <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                                                    <span className="rounded-lg border border-border bg-background px-2.5 py-1 font-medium text-foreground">
                                                        {node.productCount || 0} منتج
                                                    </span>
                                                    <span className="rounded-lg border border-border bg-background px-2.5 py-1">
                                                        {node.childrenCount || 0} عنصر فرعي
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                                    <span
                                                        className={`rounded-lg border px-2.5 py-1 font-medium ${
                                                            node.allowOrderRequest
                                                                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                                : 'border-border bg-background text-muted'
                                                        }`}
                                                    >
                                                        {node.allowOrderRequest
                                                            ? 'الطلبات مفعلة'
                                                            : 'الطلبات مغلقة'}
                                                    </span>
                                                    {node.childrenCount > 0 && (
                                                        <span className="rounded-lg border border-border bg-background px-2.5 py-1 text-muted">
                                                            {node.childrenCount} عنصر فرعي
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            <div className="inline-flex justify-center">
                                                <button
                                                    type="button"
                                                    className={`icon-btn flex h-8 w-8 items-center justify-center rounded-lg transition ${
                                                        node.isFeatured
                                                            ? 'bg-amber-500/15 text-amber-500'
                                                            : 'text-muted hover:bg-foreground/5 hover:text-amber-500'
                                                    }`}
                                                    title={
                                                        node.isFeatured
                                                            ? t('Featured on the homepage')
                                                            : t('Not featured')
                                                    }
                                                    onClick={() =>
                                                        onFlags(node, { isFeatured: !node.isFeatured })
                                                    }
                                                >
                                                    <Star
                                                        size={15}
                                                        className={
                                                            node.isFeatured
                                                                ? 'fill-amber-400 text-amber-500'
                                                                : ''
                                                        }
                                                    />
                                                </button>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            <div className="inline-flex justify-center">
                                                <Switch
                                                    checked={node.isActive}
                                                    label={t('Published')}
                                                    onChange={(value) =>
                                                        onFlags(node, { isActive: value })
                                                    }
                                                />
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-end">
                                            <div className="inline-flex items-center justify-end gap-1 rounded-xl border border-border bg-background/60 px-1.5 py-1">
                                                <Link
                                                    to={withId(ROUTES.CATALOG_EDIT, node._id)}
                                                    className="icon-btn flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-foreground/5 hover:text-foreground"
                                                    title={t('Edit')}
                                                >
                                                    <Pencil size={15} />
                                                </Link>
                                                <RowMenu
                                                    items={items}
                                                    onOpenChange={(isOpen) =>
                                                        setOpenMenuId(isOpen ? node._id : null)
                                                    }
                                                    onSelect={(action) => {
                                                        if (action === 'toggleRequests') {
                                                            onFlags(node, {
                                                                allowOrderRequest: !node.allowOrderRequest
                                                            });
                                                        } else {
                                                            onAction(action, row);
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    const renderBranch = (nodes, depth = 0, parent = null) => (
        <ul
            className={
                depth > 0
                    ? 'relative ms-8 mt-2 space-y-2 border-s-2 border-border ps-6'
                    : 'space-y-2'
            }
        >
            {nodes.map((node, index) => {
                const row = { node, depth, siblings: nodes, parent };
                const isDragging = drag.id === node._id;
                const isOver = over.id === node._id;
                const hasChildren =
                    !isFiltered && Array.isArray(node.children) && node.children.length > 0;
                const isOpen = open.has(node._id);
                const isMenuOpen = openMenuId === node._id;
                const items = getMenuItems(node, index, nodes.length);

                const counts =
                    node.kind === 'category'
                        ? t('{products} products · {items} items', {
                              products: node.productCount,
                              items: node.childrenCount
                          })
                        : node.childrenCount > 0
                          ? t('{n} sub-items', { n: node.childrenCount })
                          : '';

                return (
                    <li
                        key={node._id}
                        className={`relative ${isMenuOpen ? 'z-40' : 'z-0'}`}
                    >
                        {depth > 0 && (
                            <span
                                aria-hidden="true"
                                className="pointer-events-none absolute -start-6 top-7 h-0.5 w-6 bg-border"
                            />
                        )}

                        <div
                            draggable={!isFiltered}
                            onDragStart={(event) => {
                                if (isFiltered) return;
                                event.dataTransfer.effectAllowed = 'move';
                                event.dataTransfer.setData('text/plain', node._id);
                                setDrag({ id: node._id, forbidden: collectIds(node) });
                            }}
                            onDragOver={(event) => {
                                if (isFiltered || !drag.id) return;
                                if (drag.forbidden.has(node._id)) {
                                    if (over.id) setOver({ id: null, zone: null });
                                    return;
                                }
                                event.preventDefault();
                                const zone = zoneOf(event);
                                if (over.id !== node._id || over.zone !== zone) {
                                    setOver({ id: node._id, zone });
                                }
                            }}
                            onDrop={(event) => {
                                if (isFiltered) return;
                                event.preventDefault();
                                const dragId = drag.id;
                                const zone = over.zone || zoneOf(event);
                                const blocked = drag.forbidden.has(node._id);
                                reset();
                                if (dragId && !blocked) onMoveNode(dragId, row, zone);
                            }}
                            onDragEnd={reset}
                            className={`relative flex items-center gap-3 rounded-2xl border px-3.5 py-2.5 transition ${
                                isDragging ? 'opacity-40' : ''
                            } ${
                                isOver && over.zone === 'inside'
                                    ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                                    : `border-border hover:border-primary/40 ${
                                          node.isActive ? 'bg-surface' : 'bg-background/70'
                                      }`
                            }`}
                        >
                            {isOver && over.zone === 'before' && (
                                <span
                                    aria-hidden="true"
                                    className="pointer-events-none absolute inset-x-2 -top-1 h-0.5 rounded bg-primary"
                                />
                            )}
                            {isOver && over.zone === 'after' && (
                                <span
                                    aria-hidden="true"
                                    className="pointer-events-none absolute inset-x-2 -bottom-1 h-0.5 rounded bg-primary"
                                />
                            )}

                            <div className="flex shrink-0 items-center gap-2">
                                {!isFiltered && (
                                    <GripVertical
                                        size={16}
                                        className="hidden shrink-0 cursor-grab text-muted sm:block"
                                    />
                                )}
                                <input
                                    type="checkbox"
                                    aria-label={node.name}
                                    checked={selected.has(node._id)}
                                    onChange={() => onSelect(node._id)}
                                    className="h-4 w-4 shrink-0 rounded border-border text-primary focus:ring-primary"
                                />
                                {!isFiltered &&
                                    (hasChildren ? (
                                        <button
                                            type="button"
                                            aria-expanded={isOpen}
                                            aria-label={t('Expand')}
                                            className="icon-btn flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-foreground transition hover:bg-foreground/5"
                                            onClick={() => onToggle(node._id)}
                                        >
                                            <ChevronDown
                                                size={15}
                                                className={`transition-transform duration-200 ${
                                                    isOpen ? '' : '-rotate-90 rtl:rotate-90'
                                                }`}
                                            />
                                        </button>
                                    ) : (
                                        <span className="h-7 w-7 shrink-0" />
                                    ))}
                            </div>

                            <Thumb node={node} />

                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <Link
                                        to={withId(ROUTES.CATALOG_EDIT, node._id)}
                                        className="truncate text-sm font-semibold text-foreground transition hover:text-primary"
                                    >
                                        {node.name}
                                    </Link>
                                    {!node.isActive && (
                                        <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[11px] font-semibold text-muted">
                                            {t('Draft')}
                                        </span>
                                    )}
                                </div>
                                <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted">
                                    <KindChip kind={node.kind} />
                                    {counts && <span>{counts}</span>}
                                    {depth > 0 && parent && (
                                        <span className="truncate text-[11px] text-muted">
                                            {parent.name}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="ms-auto flex shrink-0 items-center gap-1.5 rounded-xl border border-border bg-background/60 px-2 py-1">
                                <button
                                    type="button"
                                    className={`icon-btn flex h-8 w-8 items-center justify-center rounded-lg transition ${
                                        node.isFeatured
                                            ? 'bg-amber-500/15 text-amber-500'
                                            : 'text-muted hover:bg-foreground/5 hover:text-amber-500'
                                    }`}
                                    title={
                                        node.isFeatured
                                            ? t('Featured on the homepage')
                                            : t('Not featured')
                                    }
                                    onClick={() =>
                                        onFlags(node, { isFeatured: !node.isFeatured })
                                    }
                                >
                                    <Star
                                        size={15}
                                        className={
                                            node.isFeatured ? 'fill-amber-400 text-amber-500' : ''
                                        }
                                    />
                                </button>

                                <div className="flex items-center px-1" title={t('Published')}>
                                    <Switch
                                        checked={node.isActive}
                                        label={t('Published')}
                                        onChange={(value) => onFlags(node, { isActive: value })}
                                    />
                                </div>

                                <span aria-hidden="true" className="h-4 w-px bg-border" />

                                <Link
                                    to={withId(ROUTES.CATALOG_EDIT, node._id)}
                                    className="icon-btn flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-foreground/5 hover:text-foreground"
                                    title={t('Edit')}
                                >
                                    <Pencil size={15} />
                                </Link>

                                <RowMenu
                                    items={items}
                                    onOpenChange={(menuOpen) =>
                                        setOpenMenuId(menuOpen ? node._id : null)
                                    }
                                    onSelect={(action) => {
                                        if (action === 'toggleRequests') {
                                            onFlags(node, {
                                                allowOrderRequest: !node.allowOrderRequest
                                            });
                                        } else {
                                            onAction(action, row);
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {hasChildren && isOpen && renderBranch(node.children, depth + 1, node)}
                    </li>
                );
            })}
        </ul>
    );

    return renderBranch(tree);
}