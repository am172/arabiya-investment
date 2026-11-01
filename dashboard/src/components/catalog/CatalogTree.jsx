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

const buildRows = (nodes, open, depth = 0, parent = null, rows = []) => {
    nodes.forEach((node) => {
        rows.push({ node, depth, siblings: nodes, parent });
        if (node.children.length > 0 && open.has(node._id)) buildRows(node.children, open, depth + 1, node, rows);
    });
    return rows;
};

const MENU = [
    { id: 'addCategory', label: 'Add category inside', icon: Folder },
    { id: 'addProduct', label: 'Add product inside', icon: Package },
    { id: 'duplicate', label: 'Duplicate', icon: Copy },
    { id: 'move', label: 'Move to...', icon: FolderInput },
    { id: 'up', label: 'Move up', icon: ArrowUp },
    { id: 'down', label: 'Move down', icon: ArrowDown },
    { id: 'delete', label: 'Delete', icon: Trash2, danger: true }
];

export function Thumb({ node }) {
    const Icon = node.kind === 'category' ? Folder : Package;
    return node.cover && node.cover.url ? (
        <img src={thumb(node.cover.url, 96)} alt="" className="object-cover w-10 h-10 rounded-lg shrink-0 bg-slate-100" />
    ) : (
        <span className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0 bg-slate-100 text-slate-400">
            <Icon size={18} />
        </span>
    );
}

export function KindChip({ kind }) {
    const Icon = kind === 'category' ? Folder : Package;
    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${kind === 'category' ? 'bg-amber-50 text-amber-700' : 'bg-brand-50 text-brand-700'
                }`}
        >
            <Icon size={11} />
            {t(kind === 'category' ? 'Category' : 'Product')}
        </span>
    );
}

function RowMenu({ items, onSelect }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!open) return undefined;
        const onDown = (event) => {
            if (ref.current && !ref.current.contains(event.target)) setOpen(false);
        };
        const onKey = (event) => {
            if (event.key === 'Escape') setOpen(false);
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
                className="icon-btn"
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label={t('More actions')}
                onClick={() => setOpen((value) => !value)}
            >
                <MoreHorizontal size={16} />
            </button>
            {open && (
                <ul role="menu" className="absolute end-0 top-full z-30 mt-1 w-52 rounded-xl border border-slate-200 bg-card p-1.5 shadow-xl">
                    {items.map((item) => {
                        const Icon = item.icon;
                        return (
                            <li key={item.id}>
                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => {
                                        setOpen(false);
                                        onSelect(item.id);
                                    }}
                                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-start text-sm transition hover:bg-slate-100 ${item.danger ? 'text-red-600' : 'text-slate-700'
                                        }`}
                                >
                                    <Icon size={15} />
                                    {t(item.label)}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

export default function CatalogTree({ tree, open, onToggle, selected, onSelect, onMoveNode, onFlags, onAction }) {
    const rows = useMemo(() => buildRows(tree, open), [tree, open]);
    const [drag, setDrag] = useState({ id: null, forbidden: new Set() });
    const [over, setOver] = useState({ id: null, zone: null });

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

    return (
        <ul className="space-y-1.5">
            {rows.map((row) => {
                const { node, depth } = row;
                const index = row.siblings.indexOf(node);
                const isDragging = drag.id === node._id;
                const isOver = over.id === node._id;
                const hasChildren = node.children.length > 0;
                const isOpen = open.has(node._id);
                const items = MENU.filter(
                    (item) =>
                        !(item.id === 'up' && index === 0) && !(item.id === 'down' && index === row.siblings.length - 1)
                );
                const counts =
                    node.kind === 'category'
                        ? t('{products} products · {items} items', { products: node.productCount, items: node.childrenCount })
                        : node.childrenCount > 0
                            ? t('{n} sub-items', { n: node.childrenCount })
                            : '';

                return (
                    <li key={node._id} style={{ paddingInlineStart: depth * 22 }}>
                        <div
                            draggable
                            onDragStart={(event) => {
                                event.dataTransfer.effectAllowed = 'move';
                                event.dataTransfer.setData('text/plain', node._id);
                                setDrag({ id: node._id, forbidden: collectIds(node) });
                            }}
                            onDragOver={(event) => {
                                if (!drag.id) return;
                                if (drag.forbidden.has(node._id)) {
                                    if (over.id) setOver({ id: null, zone: null });
                                    return;
                                }
                                event.preventDefault();
                                const zone = zoneOf(event);
                                if (over.id !== node._id || over.zone !== zone) setOver({ id: node._id, zone });
                            }}
                            onDrop={(event) => {
                                event.preventDefault();
                                const dragId = drag.id;
                                const zone = over.zone || zoneOf(event);
                                const blocked = drag.forbidden.has(node._id);
                                reset();
                                if (dragId && !blocked) onMoveNode(dragId, row, zone);
                            }}
                            onDragEnd={reset}
                            className={`relative flex items-center gap-2 rounded-xl border px-2.5 py-2 transition ${isDragging ? 'opacity-40' : ''
                                } ${isOver && over.zone === 'inside'
                                    ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-500/20'
                                    : `border-slate-200 hover:border-slate-300 ${node.isActive ? 'bg-card' : 'bg-slate-50'}`
                                }`}
                        >
                            {isOver && over.zone === 'before' && (
                                <span aria-hidden="true" className="pointer-events-none absolute inset-x-1 -top-1 h-0.5 rounded bg-brand-500" />
                            )}
                            {isOver && over.zone === 'after' && (
                                <span aria-hidden="true" className="pointer-events-none absolute inset-x-1 -bottom-1 h-0.5 rounded bg-brand-500" />
                            )}

                            <input
                                type="checkbox"
                                aria-label={node.name}
                                checked={selected.has(node._id)}
                                onChange={() => onSelect(node._id)}
                                className="w-4 h-4 rounded shrink-0 border-slate-300 text-brand-600 focus:ring-brand-500"
                            />
                            <GripVertical size={16} className="hidden shrink-0 cursor-grab text-slate-400 sm:block" />

                            {hasChildren ? (
                                <button
                                    type="button"
                                    aria-expanded={isOpen}
                                    aria-label={t('Expand')}
                                    className="icon-btn h-7 w-7 shrink-0"
                                    onClick={() => onToggle(node._id)}
                                >
                                    <ChevronDown size={16} className={`transition ${isOpen ? '' : '-rotate-90 rtl:rotate-90'}`} />
                                </button>
                            ) : (
                                <span className="h-7 w-7 shrink-0" />
                            )}

                            <Thumb node={node} />

                            <div className="flex-1 min-w-0">
                                <Link
                                    to={withId(ROUTES.CATALOG_EDIT, node._id)}
                                    className="block text-sm font-semibold truncate text-slate-900 hover:text-brand-600"
                                >
                                    {node.name}
                                </Link>
                                <p className="flex flex-wrap items-center text-xs gap-x-2 gap-y-1 text-slate-500">
                                    <KindChip kind={node.kind} />
                                    {counts && <span>{counts}</span>}
                                    {!node.isActive && (
                                        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                                            {t('Draft')}
                                        </span>
                                    )}
                                </p>
                            </div>

                            <button
                                type="button"
                                className="hidden icon-btn sm:inline-flex"
                                title={node.isFeatured ? t('Featured on the homepage') : t('Not featured')}
                                onClick={() => onFlags(node, { isFeatured: !node.isFeatured })}
                            >
                                <Star size={16} className={node.isFeatured ? 'fill-amber-400 text-amber-500' : ''} />
                            </button>
                            <button
                                type="button"
                                className="hidden icon-btn sm:inline-flex"
                                title={node.allowOrderRequest ? t('Requests enabled') : t('Requests disabled')}
                                onClick={() => onFlags(node, { allowOrderRequest: !node.allowOrderRequest })}
                            >
                                <ClipboardList size={16} className={node.allowOrderRequest ? 'text-emerald-600' : 'text-slate-300'} />
                            </button>
                            <Switch
                                checked={node.isActive}
                                label={t('Published')}
                                onChange={(value) => onFlags(node, { isActive: value })}
                            />
                            <Link to={withId(ROUTES.CATALOG_EDIT, node._id)} className="icon-btn" title={t('Edit')}>
                                <Pencil size={16} />
                            </Link>
                            <RowMenu items={items} onSelect={(action) => onAction(action, row)} />
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}
