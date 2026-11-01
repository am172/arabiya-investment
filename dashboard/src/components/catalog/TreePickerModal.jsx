import { useMemo, useState } from 'react';
import { Check, Folder, Loader2, Package, Search } from 'lucide-react';
import Modal from '../common/Modal';
import catalogService from '../../services/catalog.service';
import useFetch from '../../hooks/useFetch';
import { collectIds, filterTree, findNode, flattenTree } from '../../utils/catalog';
import { t } from '../../i18n';

export default function TreePickerModal({
    title,
    confirmLabel = 'Choose',
    allowRoot = false,
    excludeIds = [],
    onlyKind = '',
    onPick,
    onClose
}) {
    const { data, loading } = useFetch(() => catalogService.tree(), []);
    const [query, setQuery] = useState('');
    const [choice, setChoice] = useState(null);

    const tree = data ? data.tree : [];
    const blocked = useMemo(() => {
        const ids = new Set();
        excludeIds.forEach((id) => {
            const node = findNode(tree, id);
            if (node) collectIds(node, ids);
        });
        return ids;
    }, [tree, excludeIds]);

    const needle = query.trim().toLowerCase();
    const rows = useMemo(() => flattenTree(needle ? filterTree(tree, needle) : tree), [tree, needle]);

    return (
        <Modal open onClose={onClose} title={title} size="md">
            <div className="relative mb-3">
                <Search size={16} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                    className="input ps-10"
                    placeholder={t('Search...')}
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                />
            </div>

            <div className="max-h-80 overflow-y-auto rounded-xl border border-slate-200 p-1.5">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="animate-spin text-brand-600" />
                    </div>
                ) : (
                    <ul className="space-y-0.5">
                        {allowRoot && !needle && (
                            <li>
                                <button
                                    type="button"
                                    onClick={() => setChoice('root')}
                                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-start text-sm transition ${choice === 'root' ? 'bg-brand-50 font-semibold text-brand-700' : 'hover:bg-slate-100'
                                        }`}
                                >
                                    <Folder size={15} />
                                    {t('Top level')}
                                    {choice === 'root' && <Check size={15} className="ms-auto" />}
                                </button>
                            </li>
                        )}
                        {rows.map(({ node, depth }) => {
                            const disabled = blocked.has(node._id) || (onlyKind && node.kind !== onlyKind);
                            const Icon = node.kind === 'category' ? Folder : Package;
                            return (
                                <li key={node._id} style={{ paddingInlineStart: depth * 18 }}>
                                    <button
                                        type="button"
                                        disabled={disabled}
                                        onClick={() => setChoice(node._id)}
                                        className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-start text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${choice === node._id ? 'bg-brand-50 font-semibold text-brand-700' : 'hover:bg-slate-100'
                                            }`}
                                    >
                                        <Icon size={15} className="shrink-0" />
                                        <span className="truncate">{node.name}</span>
                                        {choice === node._id && <Check size={15} className="ms-auto shrink-0" />}
                                    </button>
                                </li>
                            );
                        })}
                        {!loading && rows.length === 0 && (
                            <li className="px-3 py-8 text-sm text-center text-slate-400">{t('No items match')}</li>
                        )}
                    </ul>
                )}
            </div>

            <div className="flex justify-end gap-3 mt-5">
                <button type="button" className="btn-secondary" onClick={onClose}>
                    {t('Cancel')}
                </button>
                <button
                    type="button"
                    className="btn-primary"
                    disabled={choice === null}
                    onClick={() => onPick(choice === 'root' ? null : choice)}
                >
                    {t(confirmLabel)}
                </button>
            </div>
        </Modal>
    );
}