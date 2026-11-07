import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2, Pencil, Plus, Trash2, Users } from 'lucide-react';
import partnerService from '../../services/partner.service';
import useFetch from '../../hooks/useFetch';
import useConfirm from '../../hooks/useConfirm';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Modal from '../../components/common/Modal';
import ImageUploader from '../../components/common/ImageUploader';
import Switch from '../../components/common/Switch';
import FormInput from '../../components/forms/FormInput';
import { mapServerErrors } from '../../utils/validators';
import { t } from '../../i18n';

const EMPTY_IMAGE = { url: '', publicId: '' };
const LINK = /^(https?:\/\/\S+|\/\S*)$/i;

function PartnerForm({ partner, onClose, onSaved }) {
    const toast = useToast();
    const [image, setImage] = useState(partner ? { url: partner.image.url, publicId: partner.image.publicId || '' } : EMPTY_IMAGE);
    const [name, setName] = useState(partner ? partner.name || '' : '');
    const [url, setUrl] = useState(partner ? partner.url || '' : '');
    const [isActive, setIsActive] = useState(partner ? partner.isActive : true);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const save = async (event) => {
        event.preventDefault();
        const found = {};
        if (!image.url) found.image = 'The logo is required';
        if (url.trim() && !LINK.test(url.trim())) found.url = 'Use a full https:// link or a /path';
        setErrors(found);
        if (Object.keys(found).length > 0) return;

        setSaving(true);
        try {
            const payload = { name: name.trim(), url: url.trim(), image, isActive };
            if (partner) await partnerService.update(partner._id, payload);
            else await partnerService.create(payload);
            toast.success('Partner saved successfully');
            onSaved();
        } catch (err) {
            setErrors(mapServerErrors(err.errors));
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal open onClose={onClose} title={partner ? 'Edit partner' : 'Add partner'} size="md">
            <form onSubmit={save} className="space-y-5">
                <ImageUploader
                    label="Partner logo"
                    folder="branding"
                    value={image}
                    error={errors.image || errors['image.url']}
                    onChange={(asset) => setImage({ url: asset.url, publicId: asset.publicId })}
                    onRemove={() => setImage(EMPTY_IMAGE)}
                    hint="Transparent PNG or WebP works best, about 400 x 200 px, up to 5 MB."
                />
                <FormInput
                    label="Partner name (optional)"
                    dir="auto"
                    maxLength={100}
                    hint="Shown if the image fails to load, and used as the image description."
                    value={name}
                    error={errors.name}
                    onChange={(event) => setName(event.target.value)}
                />
                <FormInput
                    label="Link (optional)"
                    dir="ltr"
                    maxLength={300}
                    placeholder="https://"
                    hint="Opens when visitors click the partner. Use a full https:// link."
                    value={url}
                    error={errors.url}
                    onChange={(event) => setUrl(event.target.value)}
                />
                <div className="flex items-center justify-between gap-4 p-3 border rounded-xl border-slate-200">
                    <p className="text-sm font-medium text-slate-800">{t('Show on the website')}</p>
                    <Switch checked={isActive} label={t('Show on the website')} onChange={setIsActive} />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                    <button type="button" className="btn-secondary" onClick={onClose}>
                        {t('Cancel')}
                    </button>
                    <button type="submit" className="btn-primary" disabled={saving}>
                        {saving && <Loader2 size={16} className="animate-spin" />}
                        {t('Save')}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

export default function PartnersPage() {
    const toast = useToast();
    const { confirm, confirmProps } = useConfirm();
    const { data, loading, error, refetch } = useFetch(() => partnerService.list(), []);
    const [items, setItems] = useState([]);
    const [editing, setEditing] = useState(null);
    const [dragFrom, setDragFrom] = useState(null);

    useEffect(() => {
        if (data) setItems(data);
    }, [data]);

    const persist = async (next) => {
        setItems(next);
        try {
            await partnerService.reorder(next.map((item) => item._id));
        } catch (err) {
            toast.error(err.message);
            refetch();
        }
    };

    const move = (from, to) => {
        if (from === null || from === to || to < 0 || to >= items.length) return;
        const next = [...items];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        persist(next);
    };

    const toggle = async (item) => {
        setItems((current) => current.map((entry) => (entry._id === item._id ? { ...entry, isActive: !entry.isActive } : entry)));
        try {
            await partnerService.update(item._id, { isActive: !item.isActive });
        } catch (err) {
            toast.error(err.message);
            refetch();
        }
    };

    const remove = async (item) => {
        const ok = await confirm({
            title: 'Delete partner',
            message: 'The partner and its logo will be permanently removed.',
            confirmLabel: 'Delete'
        });
        if (!ok) return;
        try {
            await partnerService.remove(item._id);
            toast.success('Partner deleted');
            refetch();
        } catch (err) {
            toast.error(err.message);
        }
    };

    if (loading && !data) return <Loader />;
    if (error || !data) return <EmptyState title="Could not load partners" description={error} />;

    return (
        <div>
            <PageHeader
                title="Success partners"
                description="Logos shown in a moving row on the home page."
                action={
                    <button type="button" className="btn-primary" onClick={() => setEditing('new')}>
                        <Plus size={16} />
                        {t('Add partner')}
                    </button>
                }
            />

            {items.length === 0 ? (
                <EmptyState
                    icon={Users}
                    title="No partners yet"
                    description="Add your first partner logo to show it on the home page."
                />
            ) : (
                <>
                    <p className="mb-4 text-sm text-slate-500">{t('Drag the logos to change their order.')}</p>
                    <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                        {items.map((item, index) => (
                            <li
                                key={item._id}
                                draggable
                                onDragStart={() => setDragFrom(index)}
                                onDragOver={(event) => event.preventDefault()}
                                onDrop={() => {
                                    move(dragFrom, index);
                                    setDragFrom(null);
                                }}
                                onDragEnd={() => setDragFrom(null)}
                                className={`card overflow-hidden transition ${dragFrom === index ? 'opacity-40' : ''} ${item.isActive ? '' : 'opacity-60'}`}
                            >
                                <div className="flex items-center justify-center p-4 h-28 cursor-grab" style={{ background: '#ffffff' }}>
                                    <img src={item.image.url} alt={item.name || ''} className="object-contain max-w-full max-h-full" />
                                </div>
                                <div className="p-3 space-y-2">
                                    <p dir="auto" className="text-sm font-semibold truncate text-slate-900">
                                        {item.name || t('No name')}
                                    </p>
                                    <p dir="ltr" className="text-xs truncate text-start text-slate-500">
                                        {item.url || t('No link')}
                                    </p>
                                    <div className="flex items-center justify-between pt-1">
                                        <Switch checked={item.isActive} label={t('Show on the website')} onChange={() => toggle(item)} />
                                        <div className="flex items-center">
                                            <button
                                                type="button"
                                                className="w-8 h-8 icon-btn disabled:opacity-30 rtl:rotate-180"
                                                disabled={index === 0}
                                                title={t('Earlier')}
                                                onClick={() => move(index, index - 1)}
                                            >
                                                <ChevronLeft size={15} />
                                            </button>
                                            <button
                                                type="button"
                                                className="w-8 h-8 icon-btn disabled:opacity-30 rtl:rotate-180"
                                                disabled={index === items.length - 1}
                                                title={t('Later')}
                                                onClick={() => move(index, index + 1)}
                                            >
                                                <ChevronRight size={15} />
                                            </button>
                                            <button type="button" className="w-8 h-8 icon-btn" title={t('Edit')} onClick={() => setEditing(item)}>
                                                <Pencil size={15} />
                                            </button>
                                            <button
                                                type="button"
                                                className="w-8 h-8 icon-btn hover:bg-red-50 hover:text-red-600"
                                                title={t('Delete')}
                                                onClick={() => remove(item)}
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </>
            )}

            {editing && (
                <PartnerForm
                    partner={editing === 'new' ? null : editing}
                    onClose={() => setEditing(null)}
                    onSaved={() => {
                        setEditing(null);
                        refetch();
                    }}
                />
            )}
            <ConfirmDialog {...confirmProps} />
        </div>
    );
}