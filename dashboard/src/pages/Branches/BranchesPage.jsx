import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Loader2, MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import branchService from '../../services/branch.service';
import useFetch from '../../hooks/useFetch';
import useConfirm from '../../hooks/useConfirm';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Modal from '../../components/common/Modal';
import Switch from '../../components/common/Switch';
import FormInput from '../../components/forms/FormInput';
import { mapServerErrors } from '../../utils/validators';
import uid from '../../utils/uid';
import { t } from '../../i18n';

const num = (value) => value !== '' && Number.isFinite(Number(value));
const text = (value) => (value === null || value === undefined ? '' : String(value));
const badLat = (value) => !num(value) || Math.abs(Number(value)) > 90;
const badLng = (value) => !num(value) || Math.abs(Number(value)) > 180;

const toForm = (item) => ({
    title: item ? item.title : '',
    lat: item ? text(item.lat) : '',
    lng: item ? text(item.lng) : '',
    isActive: item ? item.isActive : true,
    offices: (item ? item.offices : []).map((office) => ({
        _uid: uid(),
        name: office.name,
        lat: text(office.lat),
        lng: text(office.lng)
    }))
});

const validate = (form) => {
    const errors = {};
    if (!form.title.trim()) errors.title = 'The title is required';
    if (badLat(form.lat)) errors.lat = 'Latitude must be between -90 and 90';
    if (badLng(form.lng)) errors.lng = 'Longitude must be between -180 and 180';
    form.offices.forEach((office, index) => {
        if (!office.name.trim()) errors[`offices[${index}].name`] = 'The name is required';
        const hasLat = office.lat !== '';
        const hasLng = office.lng !== '';
        if (hasLat !== hasLng || (hasLat && (badLat(office.lat) || badLng(office.lng)))) {
            errors[`offices[${index}].lat`] = 'Enter both valid coordinates or leave both empty';
        }
    });
    return errors;
};

const toPayload = (form) => ({
    title: form.title.trim(),
    lat: Number(form.lat),
    lng: Number(form.lng),
    isActive: form.isActive,
    offices: form.offices.map((office) => ({
        name: office.name.trim(),
        lat: office.lat === '' ? null : Number(office.lat),
        lng: office.lng === '' ? null : Number(office.lng)
    }))
});

function BranchForm({ item, onClose, onSaved }) {
    const toast = useToast();
    const [form, setForm] = useState(() => toForm(item));
    const [paste, setPaste] = useState('');
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
    const patchOffice = (id, change) =>
        set('offices', form.offices.map((office) => (office._uid === id ? { ...office, ...change } : office)));

    const applyPaste = (value) => {
        setPaste(value);
        const parts = value.split(/[,\s]+/).filter(Boolean).map(Number);
        if (parts.length === 2 && parts.every(Number.isFinite)) {
            setForm((current) => ({ ...current, lat: String(parts[0]), lng: String(parts[1]) }));
        }
    };

    const save = async (event) => {
        event.preventDefault();
        const found = validate(form);
        setErrors(found);
        if (Object.keys(found).length > 0) return;

        setSaving(true);
        try {
            if (item) await branchService.update(item._id, toPayload(form));
            else await branchService.create(toPayload(form));
            toast.success('Branch saved successfully');
            onSaved();
        } catch (err) {
            setErrors(mapServerErrors(err.errors));
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal open onClose={onClose} title={item ? 'Edit branch group' : 'Add branch group'} size="lg">
            <form onSubmit={save} className="space-y-5">
                <FormInput
                    label="Main title"
                    dir="auto"
                    maxLength={100}
                    placeholder={t('e.g. Riyadh branches')}
                    value={form.title}
                    error={errors.title}
                    onChange={(event) => set('title', event.target.value)}
                />

                <div className="p-4 space-y-4 border rounded-xl border-slate-200">
                    <p className="text-sm font-semibold text-slate-800">{t('Map location of this group')}</p>
                    <FormInput
                        label="Paste coordinates"
                        dir="ltr"
                        placeholder="24.7136, 46.6753"
                        hint="Copy 'latitude, longitude' from OpenStreetMap or Google Maps (right-click on the place) and paste it here."
                        value={paste}
                        onChange={(event) => applyPaste(event.target.value)}
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormInput
                            label="Latitude"
                            dir="ltr"
                            type="number"
                            step="any"
                            value={form.lat}
                            error={errors.lat}
                            onChange={(event) => set('lat', event.target.value)}
                        />
                        <FormInput
                            label="Longitude"
                            dir="ltr"
                            type="number"
                            step="any"
                            value={form.lng}
                            error={errors.lng}
                            onChange={(event) => set('lng', event.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <p className="text-sm font-semibold text-slate-800">{t('Offices and sub-addresses')}</p>
                    {form.offices.map((office, index) => (
                        <div key={office._uid} className="p-3 space-y-2 border rounded-xl border-slate-200">
                            <div className="flex items-start gap-2">
                                <div className="flex-1">
                                    <input
                                        dir="auto"
                                        className={`input ${errors[`offices[${index}].name`] ? 'input-error' : ''}`}
                                        placeholder={t('Office name or address')}
                                        maxLength={120}
                                        value={office.name}
                                        onChange={(event) => patchOffice(office._uid, { name: event.target.value })}
                                    />
                                    {errors[`offices[${index}].name`] && <p className="error-text">{t(errors[`offices[${index}].name`])}</p>}
                                </div>
                                <button
                                    type="button"
                                    className="icon-btn hover:bg-red-50 hover:text-red-600"
                                    title={t('Delete')}
                                    onClick={() => set('offices', form.offices.filter((entry) => entry._uid !== office._uid))}
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>
                            <div className="grid gap-2 sm:grid-cols-2">
                                <input
                                    dir="ltr"
                                    type="number"
                                    step="any"
                                    className="py-2 text-xs input"
                                    placeholder={t('Latitude (optional)')}
                                    value={office.lat}
                                    onChange={(event) => patchOffice(office._uid, { lat: event.target.value })}
                                />
                                <input
                                    dir="ltr"
                                    type="number"
                                    step="any"
                                    className="py-2 text-xs input"
                                    placeholder={t('Longitude (optional)')}
                                    value={office.lng}
                                    onChange={(event) => patchOffice(office._uid, { lng: event.target.value })}
                                />
                            </div>
                            {errors[`offices[${index}].lat`] && <p className="error-text">{t(errors[`offices[${index}].lat`])}</p>}
                        </div>
                    ))}
                    <button
                        type="button"
                        className="btn-secondary"
                        disabled={form.offices.length >= 30}
                        onClick={() => set('offices', [...form.offices, { _uid: uid(), name: '', lat: '', lng: '' }])}
                    >
                        <Plus size={16} />
                        {t('Add office')}
                    </button>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-xl border-slate-200">
                    <p className="text-sm font-medium text-slate-800">{t('Show on the website')}</p>
                    <Switch checked={form.isActive} label={t('Show on the website')} onChange={(value) => set('isActive', value)} />
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

export default function BranchesPage() {
    const toast = useToast();
    const { confirm, confirmProps } = useConfirm();
    const { data, loading, error, refetch } = useFetch(() => branchService.list(), []);
    const [items, setItems] = useState([]);
    const [editing, setEditing] = useState(null);

    useEffect(() => {
        if (data) setItems(data);
    }, [data]);

    const move = async (index, delta) => {
        const target = index + delta;
        if (target < 0 || target >= items.length) return;
        const next = [...items];
        [next[index], next[target]] = [next[target], next[index]];
        setItems(next);
        try {
            await branchService.reorder(next.map((item) => item._id));
        } catch (err) {
            toast.error(err.message);
            refetch();
        }
    };

    const toggle = async (item) => {
        setItems((current) => current.map((entry) => (entry._id === item._id ? { ...entry, isActive: !entry.isActive } : entry)));
        try {
            await branchService.update(item._id, { isActive: !item.isActive });
        } catch (err) {
            toast.error(err.message);
            refetch();
        }
    };

    const remove = async (item) => {
        const ok = await confirm({
            title: 'Delete branch group',
            message: 'The group and all its offices will be permanently removed.',
            confirmLabel: 'Delete'
        });
        if (!ok) return;
        try {
            await branchService.remove(item._id);
            toast.success('Branch deleted');
            refetch();
        } catch (err) {
            toast.error(err.message);
        }
    };

    if (loading && !data) return <Loader />;
    if (error || !data) return <EmptyState title="Could not load branches" description={error} />;

    return (
        <div>
            <PageHeader
                title="Our branches"
                description="Branch groups with their offices, shown beside a free map on the home page."
                action={
                    <button type="button" className="btn-primary" onClick={() => setEditing('new')}>
                        <Plus size={16} />
                        {t('Add branch group')}
                    </button>
                }
            />

            {items.length === 0 ? (
                <EmptyState icon={MapPin} title="No branches yet" description="Add your first branch group to show the map on the home page." />
            ) : (
                <ul className="space-y-3">
                    {items.map((item, index) => (
                        <li key={item._id} className={`card p-4 ${item.isActive ? '' : 'opacity-60'}`}>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <p dir="auto" className="flex items-center gap-2 text-base font-semibold text-slate-900">
                                        <MapPin size={16} className="shrink-0 text-brand-600" />
                                        {item.title}
                                    </p>
                                    <p dir="ltr" className="text-xs text-start text-slate-500">
                                        {item.lat}, {item.lng}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Switch checked={item.isActive} label={t('Show on the website')} onChange={() => toggle(item)} />
                                    <button type="button" className="icon-btn disabled:opacity-30" disabled={index === 0} title={t('Move up')} onClick={() => move(index, -1)}>
                                        <ArrowUp size={15} />
                                    </button>
                                    <button
                                        type="button"
                                        className="icon-btn disabled:opacity-30"
                                        disabled={index === items.length - 1}
                                        title={t('Move down')}
                                        onClick={() => move(index, 1)}
                                    >
                                        <ArrowDown size={15} />
                                    </button>
                                    <button type="button" className="icon-btn" title={t('Edit')} onClick={() => setEditing(item)}>
                                        <Pencil size={15} />
                                    </button>
                                    <button type="button" className="icon-btn hover:bg-red-50 hover:text-red-600" title={t('Delete')} onClick={() => remove(item)}>
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                            {item.offices.length > 0 && (
                                <ul className="flex flex-wrap gap-2 mt-3">
                                    {item.offices.map((office) => (
                                        <li key={office.name} dir="auto" className="px-3 py-1 text-xs rounded-full bg-slate-100 text-slate-600">
                                            {office.name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {editing && (
                <BranchForm
                    item={editing === 'new' ? null : editing}
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