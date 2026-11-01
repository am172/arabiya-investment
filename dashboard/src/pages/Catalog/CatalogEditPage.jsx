import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowRight, Copy, ExternalLink, FolderInput, Info, Loader2, Save, Trash2 } from 'lucide-react';
import catalogService from '../../services/catalog.service';
import useFetch from '../../hooks/useFetch';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Switch from '../../components/common/Switch';
import DeleteDialog from '../../components/catalog/DeleteDialog';
import DuplicateDialog from '../../components/catalog/DuplicateDialog';
import TreePickerModal from '../../components/catalog/TreePickerModal';
import GeneralTab from '../../components/catalog/tabs/GeneralTab';
import MediaTab from '../../components/catalog/tabs/MediaTab';
import ContentTab from '../../components/catalog/tabs/ContentTab';
import OptionsTab from '../../components/catalog/tabs/OptionsTab';
import SeoTab from '../../components/catalog/tabs/SeoTab';
import { SITE_URL } from '../../constants/config';
import { CHOICE_TYPES } from '../../constants/catalog';
import { ROUTES, withId } from '../../constants/routes';
import { nodeToForm, nodeToPayload } from '../../utils/catalog';
import { mapServerErrors } from '../../utils/validators';
import { t } from '../../i18n';

const TABS = [
    { id: 'general', label: 'General', keys: ['name', 'slug', 'summary', 'description', 'sku', 'badges', 'tags', 'ctaLabel', 'kind', 'parent'] },
    { id: 'media', label: 'Media', keys: ['banner', 'gallery', 'documents'] },
    { id: 'content', label: 'Features & specs', keys: ['features', 'specs'] },
    { id: 'options', label: 'Order options', keys: ['options'] },
    { id: 'seo', label: 'SEO', keys: ['seo'] }
];

const signature = (form, isCreate) => JSON.stringify(nodeToPayload(form, isCreate));

const hasErrors = (errors, keys) => Object.keys(errors).some((key) => keys.some((prefix) => key.startsWith(prefix)));

const validate = (form) => {
    const errors = {};
    if (!form.name.trim()) errors.name = 'Name is required';

    form.options.forEach((option, index) => {
        const path = `options[${index}]`;
        if (!option.title.trim()) errors[`${path}.title`] = 'Option title is required';
        if (CHOICE_TYPES.includes(option.type) && !option.values.some((value) => value.label.trim())) {
            errors[`${path}.values`] = 'Add at least one choice';
        }
        if (option.type === 'number' && option.min !== '' && option.max !== '' && Number(option.min) > Number(option.max)) {
            errors[`${path}.min`] = 'Minimum cannot exceed maximum';
        }
    });
    form.features.forEach((item, index) => {
        if (!item.title.trim() && item.text.trim()) errors[`features[${index}].title`] = 'Feature title is required';
    });
    form.specs.forEach((item, index) => {
        if (!item.label.trim() && item.value.trim()) errors[`specs[${index}].label`] = 'Specification name is required';
    });
    form.documents.forEach((item, index) => {
        if (!item.title.trim()) errors[`documents[${index}].title`] = 'Document title is required';
    });
    return errors;
};

const keepUids = (previous, next) => ({
    ...next,
    options: next.options.map((option, index) => {
        const old = previous.options[index];
        if (!old || old.title.trim() !== option.title) return option;
        return {
            ...option,
            _uid: old._uid,
            values: option.values.map((value, position) => {
                const oldValue = old.values[position];
                return oldValue && oldValue.label.trim() === value.label ? { ...value, _uid: oldValue._uid } : value;
            })
        };
    })
});

export default function CatalogEditPage() {
    const { id } = useParams();
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const toast = useToast();
    const isCreate = !id;

    const nodeQuery = useFetch(() => (id ? catalogService.get(id) : Promise.resolve({ data: null })), [id]);
    const node = nodeQuery.data;
    const parentId = isCreate ? params.get('parent') || '' : node ? node.parent || '' : '';
    const parentQuery = useFetch(
        () => (parentId ? catalogService.get(parentId) : Promise.resolve({ data: null })),
        [parentId]
    );
    const parent = parentQuery.data;

    const [form, setForm] = useState(null);
    const [saved, setSaved] = useState('');
    const [errors, setErrors] = useState({});
    const [tab, setTab] = useState('general');
    const [saving, setSaving] = useState(false);
    const [busy, setBusy] = useState(false);
    const [dialog, setDialog] = useState('');
    const loaded = useRef('');

    useEffect(() => {
        const key = isCreate ? `new-${params.get('kind')}-${params.get('parent')}` : node && node._id;
        if (!key || loaded.current === key) return;
        loaded.current = key;
        const next = nodeToForm(node || undefined, {
            kind: params.get('kind') === 'category' ? 'category' : 'product',
            parent: params.get('parent') || ''
        });
        setForm(next);
        setSaved(signature(next, isCreate));
    }, [isCreate, node, params]);

    const dirty = Boolean(form) && signature(form, isCreate) !== saved;

    useEffect(() => {
        if (!dirty) return undefined;
        const warn = (event) => {
            event.preventDefault();
            event.returnValue = '';
        };
        window.addEventListener('beforeunload', warn);
        return () => window.removeEventListener('beforeunload', warn);
    }, [dirty]);

    const update = (key, value) =>
        setForm((current) => ({ ...current, [key]: typeof value === 'function' ? value(current[key]) : value }));

    const trail = useMemo(() => {
        if (isCreate) {
            return parent ? [...parent.breadcrumbs, { _id: parent._id, name: parent.name, kind: parent.kind }] : [];
        }
        return node ? node.breadcrumbs : [];
    }, [isCreate, parent, node]);

    const jumpToError = (found) => {
        const first = TABS.find((item) => hasErrors(found, item.keys));
        if (first) setTab(first.id);
    };

    const handleSave = async () => {
        const found = validate(form);
        setErrors(found);
        if (Object.keys(found).length > 0) {
            jumpToError(found);
            toast.error('Please fix the highlighted fields');
            return;
        }

        setSaving(true);
        try {
            const payload = nodeToPayload(form, isCreate);
            if (isCreate) {
                const res = await catalogService.create(payload);
                setSaved(signature(form, true));
                toast.success('Item created successfully');
                navigate(withId(ROUTES.CATALOG_EDIT, res.data._id), { replace: true });
            } else {
                const res = await catalogService.update(id, payload);
                const next = keepUids(form, nodeToForm(res.data));
                setForm(next);
                setSaved(signature(next, false));
                setErrors({});
                toast.success('Item updated successfully');
                nodeQuery.refetch();
            }
        } catch (err) {
            const mapped = mapServerErrors(err.errors);
            setErrors(mapped);
            jumpToError(mapped);
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleMove = async (target) => {
        setDialog('');
        try {
            await catalogService.move(id, target);
            toast.success('Item moved successfully');
            nodeQuery.refetch();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleDelete = async (strategy) => {
        setBusy(true);
        try {
            await catalogService.remove(id, strategy);
            toast.success('Item deleted successfully');
            setSaved(signature(form, false));
            navigate(ROUTES.CATALOG, { replace: true });
        } catch (err) {
            toast.error(err.message);
            setBusy(false);
        }
    };

    const handleDuplicate = async (options) => {
        setBusy(true);
        try {
            const res = await catalogService.duplicate(id, options);
            toast.success('Item duplicated successfully');
            setDialog('');
            navigate(withId(ROUTES.CATALOG_EDIT, res.data._id));
        } catch (err) {
            toast.error(err.message);
        } finally {
            setBusy(false);
        }
    };

    if (!isCreate && nodeQuery.loading && !node) return <Loader />;
    if (!isCreate && !node) return <EmptyState title="Could not load the item" description={nodeQuery.error} />;
    if (!form) return <Loader />;

    const base = form.kind === 'category' ? '/categories/' : '/products/';
    const siteLink = SITE_URL && node && node.isActive ? `${SITE_URL}${base}${encodeURI(node.slug)}` : '';
    const counts = { media: form.gallery.length + form.documents.length, content: form.features.length + form.specs.length, options: form.options.length };

    return (
        <div>
            <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <Link to={ROUTES.CATALOG} className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800">
                        <ArrowRight size={14} />
                        {t('Back to catalog')}
                    </Link>
                    <h1 className="text-2xl font-bold truncate text-slate-900">
                        {isCreate ? t(form.kind === 'category' ? 'Add category' : 'Add product') : form.name || node.name}
                    </h1>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {dirty && <span className="hidden text-sm font-medium text-amber-600 sm:inline">{t('Unsaved changes')}</span>}
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                        <Switch checked={form.isActive} label={t('Published')} onChange={(value) => update('isActive', value)} />
                        {t(form.isActive ? 'Published' : 'Draft')}
                    </label>
                    {siteLink && (
                        <a href={siteLink} target="_blank" rel="noopener noreferrer" className="icon-btn" title={t('View on website')}>
                            <ExternalLink size={16} />
                        </a>
                    )}
                    {!isCreate && (
                        <>
                            <button type="button" className="icon-btn" title={t('Move')} onClick={() => setDialog('move')}>
                                <FolderInput size={16} />
                            </button>
                            <button type="button" className="icon-btn" title={t('Duplicate')} onClick={() => setDialog('duplicate')}>
                                <Copy size={16} />
                            </button>
                            <button type="button" className="icon-btn hover:bg-red-50 hover:text-red-600" title={t('Delete')} onClick={() => setDialog('delete')}>
                                <Trash2 size={16} />
                            </button>
                        </>
                    )}
                    <button type="button" className="btn-primary" disabled={saving || (!isCreate && !dirty)} onClick={handleSave}>
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {t('Save')}
                    </button>
                </div>
            </div>

            {!form.isActive && (
                <div className="flex items-start gap-3 px-4 py-3 mb-5 text-sm font-medium border rounded-xl border-amber-200 bg-amber-50 text-amber-800">
                    <Info size={18} className="mt-0.5 shrink-0" />
                    {t('This item is a draft. It is not visible on the website until you publish it.')}
                </div>
            )}

            <div role="tablist" className="flex gap-2 px-1 pb-2 mb-5 -mx-1 overflow-x-auto">
                {TABS.map((item) => {
                    const selected = item.id === tab;
                    const count = counts[item.id];
                    return (
                        <button
                            key={item.id}
                            type="button"
                            role="tab"
                            aria-selected={selected}
                            onClick={() => setTab(item.id)}
                            className={`relative inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${selected ? 'bg-brand-600 text-white shadow-sm' : 'bg-card text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            {t(item.label)}
                            {count > 0 && (
                                <span className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${selected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                    {count}
                                </span>
                            )}
                            {hasErrors(errors, item.keys) && (
                                <span className="absolute -end-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                            )}
                        </button>
                    );
                })}
            </div>

            {tab === 'general' && (
                <GeneralTab form={form} update={update} errors={errors} node={node} trail={trail} onMove={() => setDialog('move')} />
            )}
            {tab === 'media' && <MediaTab form={form} update={update} errors={errors} />}
            {tab === 'content' && <ContentTab form={form} update={update} errors={errors} />}
            {tab === 'options' && (
                <OptionsTab
                    form={form}
                    update={update}
                    errors={errors}
                    nodeId={node ? node._id : ''}
                    inherited={parent ? parent.effectiveOptions : []}
                    parentName={parent ? parent.name : ''}
                />
            )}
            {tab === 'seo' && <SeoTab form={form} update={update} errors={errors} />}

            {dialog === 'move' && (
                <TreePickerModal title="Move item" confirmLabel="Move here" allowRoot excludeIds={[id]} onPick={handleMove} onClose={() => setDialog('')} />
            )}
            {dialog === 'duplicate' && (
                <DuplicateDialog hasChildren={node.children.length > 0} busy={busy} onConfirm={handleDuplicate} onClose={() => setDialog('')} />
            )}
            {dialog === 'delete' && (
                <DeleteDialog name={node.name} childrenCount={node.children.length} busy={busy} onConfirm={handleDelete} onClose={() => setDialog('')} />
            )}
        </div>
    );
}