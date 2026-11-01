import { useMemo, useState } from 'react';
import { BookmarkPlus, CopyPlus, Layers, Loader2 } from 'lucide-react';
import Modal from '../../common/Modal';
import FormInput, { FormToggle } from '../../forms/FormInput';
import OptionsBuilder from '../OptionsBuilder';
import RequestFormPreview from '../RequestFormPreview';
import TemplatePickerModal from '../TemplatePickerModal';
import TreePickerModal from '../TreePickerModal';
import catalogService from '../../../services/catalog.service';
import optionTemplateService from '../../../services/optionTemplate.service';
import { useToast } from '../../../context/ToastContext';
import { LIMITS } from '../../../constants/catalog';
import { freshOptions, optionsToPayload, previewOptions } from '../../../utils/catalog';
import { t } from '../../../i18n';

function SaveTemplateModal({ options, onClose }) {
    const toast = useToast();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const save = async (event) => {
        event.preventDefault();
        if (!name.trim()) {
            setError('Name is required');
            return;
        }
        setSaving(true);
        try {
            await optionTemplateService.create({
                name: name.trim(),
                description: description.trim(),
                options: optionsToPayload(options)
            });
            toast.success('Template saved successfully');
            onClose();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal open onClose={onClose} title="Save as template" size="sm">
            <form onSubmit={save} className="space-y-4">
                <FormInput label="Template name" dir="auto" maxLength={120} value={name} error={error} onChange={(event) => setName(event.target.value)} />
                <FormInput
                    label="Description (optional)"
                    dir="auto"
                    maxLength={300}
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                />
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

export default function OptionsTab({ form, update, errors, nodeId, inherited, parentName }) {
    const toast = useToast();
    const [templateOpen, setTemplateOpen] = useState(false);
    const [copyOpen, setCopyOpen] = useState(false);
    const [saveOpen, setSaveOpen] = useState(false);

    const preview = useMemo(
        () => [...(form.inheritOptions ? inherited : []), ...previewOptions(form.options)],
        [form.inheritOptions, inherited, form.options]
    );

    const merge = (incoming, mode) => {
        update('options', (current) => [...(mode === 'replace' ? [] : current), ...incoming].slice(0, LIMITS.options));
    };

    const applyTemplate = (template, mode) => {
        merge(freshOptions(template.options), mode);
        setTemplateOpen(false);
        toast.success('Template applied');
    };

    const copyFrom = async (id) => {
        setCopyOpen(false);
        try {
            const res = await catalogService.get(id);
            const incoming = freshOptions(res.data.effectiveOptions);
            merge(incoming, 'append');
            toast.success(t('{n} options copied', { n: incoming.length }));
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <div className="grid gap-6 xl:grid-cols-5">
            <div className="space-y-5 xl:col-span-3">
                <section className="p-6 space-y-4 card">
                    <div>
                        <h3 className="text-base font-semibold text-slate-900">{t('Order options')}</h3>
                        <p className="mt-1 text-sm text-slate-500">
                            {t('Choices the customer fills in when requesting this item. Add anything: sizes, packaging, quantity, delivery place.')}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button type="button" className="btn-secondary px-3 py-1.5 text-xs" onClick={() => setTemplateOpen(true)}>
                            <Layers size={14} />
                            {t('Apply a template')}
                        </button>
                        <button type="button" className="btn-secondary px-3 py-1.5 text-xs" onClick={() => setCopyOpen(true)}>
                            <CopyPlus size={14} />
                            {t('Copy from another item')}
                        </button>
                        <button
                            type="button"
                            className="btn-secondary px-3 py-1.5 text-xs"
                            disabled={form.options.length === 0}
                            onClick={() => setSaveOpen(true)}
                        >
                            <BookmarkPlus size={14} />
                            {t('Save as template')}
                        </button>
                    </div>

                    <FormToggle
                        label="Inherit options from parent items"
                        hint="Customers also see the options of the items above this one, followed by this item's own options."
                        checked={form.inheritOptions}
                        onChange={(value) => update('inheritOptions', value)}
                    />

                    {form.inheritOptions && (
                        <div className="p-4 border rounded-xl border-brand-100 bg-brand-50/40">
                            <p className="text-sm font-semibold text-slate-800">{t('Inherited options')}</p>
                            {inherited.length === 0 ? (
                                <p className="mt-1 text-xs text-slate-500">
                                    {form.parent || nodeId
                                        ? t('The parent items have no options to inherit')
                                        : t('This item has no parent, so there is nothing to inherit')}
                                </p>
                            ) : (
                                <>
                                    <p className="mt-1 text-xs text-slate-500">
                                        {t('Options inherited from "{name}" and its parents', { name: parentName })}
                                    </p>
                                    <ul className="flex flex-wrap gap-2 mt-3">
                                        {inherited.map((option) => (
                                            <li key={option.key} className="px-3 py-1 text-xs font-medium rounded-full bg-card text-slate-700 ring-1 ring-slate-200">
                                                {option.title}
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </div>
                    )}
                </section>

                <OptionsBuilder options={form.options} errors={errors} onChange={(value) => update('options', value)} />
            </div>

            <div className="xl:col-span-2">
                <div className="xl:sticky xl:top-4">
                    <RequestFormPreview options={preview} ctaLabel={form.ctaLabel} />
                </div>
            </div>

            {templateOpen && <TemplatePickerModal onApply={applyTemplate} onClose={() => setTemplateOpen(false)} />}
            {copyOpen && (
                <TreePickerModal
                    title="Copy options from another item"
                    confirmLabel="Copy options"
                    excludeIds={nodeId ? [nodeId] : []}
                    onPick={copyFrom}
                    onClose={() => setCopyOpen(false)}
                />
            )}
            {saveOpen && <SaveTemplateModal options={form.options} onClose={() => setSaveOpen(false)} />}
        </div>
    );
}