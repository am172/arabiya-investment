import { useState } from 'react';
import { Layers, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import optionTemplateService from '../../services/optionTemplate.service';
import useFetch from '../../hooks/useFetch';
import useConfirm from '../../hooks/useConfirm';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Modal from '../../components/common/Modal';
import FormInput from '../../components/forms/FormInput';
import OptionsBuilder from '../../components/catalog/OptionsBuilder';
import { optionsToForm, optionsToPayload } from '../../utils/catalog';
import { mapServerErrors } from '../../utils/validators';
import { formatDate } from '../../utils/formatters';
import { CHOICE_TYPES } from '../../constants/catalog';
import { t } from '../../i18n';

function TemplateEditor({ template, onClose, onSaved }) {
    const toast = useToast();
    const [name, setName] = useState(template ? template.name : '');
    const [description, setDescription] = useState(template ? template.description || '' : '');
    const [options, setOptions] = useState(() => optionsToForm(template ? template.options : []));
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const save = async (event) => {
        event.preventDefault();
        const found = {};
        if (!name.trim()) found.name = 'Name is required';
        options.forEach((option, index) => {
            if (!option.title.trim()) found[`options[${index}].title`] = 'Option title is required';
            if (CHOICE_TYPES.includes(option.type) && !option.values.some((value) => value.label.trim())) {
                found[`options[${index}].values`] = 'Add at least one choice';
            }
        });
        setErrors(found);
        if (Object.keys(found).length > 0) return;

        setSaving(true);
        try {
            const payload = { name: name.trim(), description: description.trim(), options: optionsToPayload(options) };
            if (template) await optionTemplateService.update(template._id, payload);
            else await optionTemplateService.create(payload);
            toast.success('Template saved successfully');
            onSaved();
        } catch (err) {
            setErrors(mapServerErrors(err.errors));
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal open onClose={onClose} title={template ? 'Edit template' : 'New template'} size="lg">
            <form onSubmit={save} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                    <FormInput label="Template name" dir="auto" maxLength={120} value={name} error={errors.name} onChange={(event) => setName(event.target.value)} />
                    <FormInput
                        label="Description (optional)"
                        dir="auto"
                        maxLength={300}
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                    />
                </div>
                <OptionsBuilder options={options} errors={errors} onChange={setOptions} />
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
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

export default function OptionTemplatesPage() {
    const toast = useToast();
    const { confirm, confirmProps } = useConfirm();
    const { data, loading, error, refetch } = useFetch(() => optionTemplateService.list(), []);
    const [editing, setEditing] = useState(null);

    const handleDelete = async (template) => {
        const ok = await confirm({
            title: 'Delete template',
            message: t('"{name}" will be deleted. Products that already use its options are not affected.', { name: template.name }),
            confirmLabel: 'Delete'
        });
        if (!ok) return;
        try {
            await optionTemplateService.remove(template._id);
            toast.success('Template deleted successfully');
            refetch();
        } catch (err) {
            toast.error(err.message);
        }
    };

    if (loading && !data) return <Loader />;
    if (error || !data) return <EmptyState title="Could not load templates" description={error} />;

    return (
        <div>
            <PageHeader
                title="Option templates"
                description="Save sets of order options once and apply them to any product in one click."
                action={
                    <button type="button" className="btn-primary" onClick={() => setEditing('new')}>
                        <Plus size={16} />
                        {t('New template')}
                    </button>
                }
            />

            {data.length === 0 ? (
                <EmptyState
                    icon={Layers}
                    title="No templates yet"
                    description="Create one here, or save a product's options as a template from its Order options tab."
                />
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {data.map((template) => (
                        <div key={template._id} className="flex flex-col p-5 card">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <h3 className="text-base font-semibold truncate text-slate-900">{template.name}</h3>
                                    {template.description && <p className="mt-1 text-sm line-clamp-2 text-slate-500">{template.description}</p>}
                                </div>
                                <div className="flex gap-1 shrink-0">
                                    <button type="button" className="icon-btn" title={t('Edit')} onClick={() => setEditing(template)}>
                                        <Pencil size={15} />
                                    </button>
                                    <button type="button" className="icon-btn hover:bg-red-50 hover:text-red-600" title={t('Delete')} onClick={() => handleDelete(template)}>
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                            <div className="mt-4 flex flex-1 flex-wrap content-start gap-1.5">
                                {template.options.map((option) => (
                                    <span key={option.key} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                                        {option.title}
                                    </span>
                                ))}
                            </div>
                            <p className="mt-4 text-xs text-slate-400">
                                {template.options.length} {t('options')} · {formatDate(template.updatedAt)}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {editing && (
                <TemplateEditor
                    template={editing === 'new' ? null : editing}
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