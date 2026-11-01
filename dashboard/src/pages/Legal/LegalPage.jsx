import { useEffect, useMemo, useState } from 'react';
import { Info, Loader2, RotateCcw, Save } from 'lucide-react';
import legalService from '../../services/legal.service';
import useFetch from '../../hooks/useFetch';
import useConfirm from '../../hooks/useConfirm';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import FormInput from '../../components/forms/FormInput';
import FormTextarea from '../../components/forms/FormTextarea';
import ContentListEditor from '../../components/content/ContentListEditor';
import { formatDateTime } from '../../utils/formatters';
import { mapServerErrors } from '../../utils/validators';
import uid from '../../utils/uid';
import { t } from '../../i18n';

const TABS = [
    { id: 'privacy', label: 'Privacy policy' },
    { id: 'terms', label: 'Terms & conditions' }
];

const SECTION_CONFIG = {
    max: 30,
    summaryKey: 'heading',
    addLabel: 'Add section',
    emptyLabel: 'No sections yet',
    newLabel: 'New section',
    create: () => ({ _uid: uid(), heading: '', body: '' }),
    fields: [
        { key: 'heading', type: 'text', label: 'Section heading', max: 150, full: true },
        { key: 'body', type: 'textarea', label: 'Content', max: 5000, rows: 9, full: true }
    ]
};

const toDraft = (data) => ({
    title: data.title || '',
    intro: data.intro || '',
    sections: (data.sections || []).map((section) => ({ ...section, _uid: uid() }))
});

const toPayload = (draft) => ({
    title: draft.title.trim(),
    intro: draft.intro.trim(),
    sections: draft.sections.map(({ _uid, ...rest }) => rest)
});

const validate = (draft) => {
    const errors = {};
    if (!draft.title.trim()) errors.title = 'The title is required';
    draft.sections.forEach((section, index) => {
        if (!section.heading.trim()) errors[`sections[${index}].heading`] = 'This field is required';
        if (!section.body.trim()) errors[`sections[${index}].body`] = 'This field is required';
    });
    return errors;
};

function LegalEditor({ slug, onDirtyChange }) {
    const toast = useToast();
    const { confirm, confirmProps } = useConfirm();
    const { data, loading, error } = useFetch(() => legalService.get(slug), [slug]);
    const [draft, setDraft] = useState(null);
    const [saved, setSaved] = useState('');
    const [updatedAt, setUpdatedAt] = useState(null);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const applyServer = (next) => {
        const fresh = toDraft(next);
        setDraft(fresh);
        setSaved(JSON.stringify(toPayload(fresh)));
        setUpdatedAt(next.updatedAt);
        setErrors({});
    };

    useEffect(() => {
        if (data) applyServer(data);
    }, [data]);

    const dirty = useMemo(
        () => Boolean(draft) && JSON.stringify(toPayload(draft)) !== saved,
        [draft, saved]
    );

    useEffect(() => {
        onDirtyChange(dirty);
        if (!dirty) return undefined;
        const warn = (event) => {
            event.preventDefault();
            event.returnValue = '';
        };
        window.addEventListener('beforeunload', warn);
        return () => window.removeEventListener('beforeunload', warn);
    }, [dirty]);

    const handleSave = async () => {
        const found = validate(draft);
        setErrors(found);
        if (Object.keys(found).length > 0) {
            toast.error('Please fix the highlighted fields');
            return;
        }

        setSaving(true);
        try {
            const res = await legalService.update(slug, toPayload(draft));
            applyServer(res.data);
            toast.success('Page saved. The website will update shortly.');
        } catch (err) {
            setErrors(mapServerErrors(err.errors));
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleReset = async () => {
        const ok = await confirm({
            title: 'Reset this page',
            message: 'The page returns to the default text. Your edits will be lost.',
            confirmLabel: 'Reset'
        });
        if (!ok) return;
        try {
            const res = await legalService.reset(slug);
            applyServer(res.data);
            toast.success('Page reset to defaults');
        } catch (err) {
            toast.error(err.message);
        }
    };

    if (loading && !draft) return <Loader />;
    if (!draft) return <EmptyState title="Could not load the page" description={error} />;

    return (
        <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-500">
                    {t('Last saved: {date}', { date: updatedAt ? formatDateTime(updatedAt) : '—' })}
                    {dirty && <span className="font-medium ms-3 text-amber-600">{t('Unsaved changes')}</span>}
                </p>
                <div className="flex gap-3">
                    <button type="button" className="btn-secondary" onClick={handleReset}>
                        <RotateCcw size={16} />
                        {t('Reset')}
                    </button>
                    <button type="button" className="btn-primary" disabled={saving || !dirty} onClick={handleSave}>
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {t('Save page')}
                    </button>
                </div>
            </div>

            <section className="flex gap-3 p-5 card border-brand-100 bg-brand-50/40">
                <Info size={18} className="mt-0.5 shrink-0 text-brand-600" />
                <p className="text-sm text-slate-600">
                    {t(
                        'Inside a section, leave a blank line to start a new paragraph. Start a line with "- " to make a bullet list. Plain text only: HTML is shown as typed, not rendered.'
                    )}
                </p>
            </section>

            <section className="p-6 space-y-5 card">
                <FormInput
                    label="Page title"
                    dir="auto"
                    maxLength={120}
                    value={draft.title}
                    error={errors.title}
                    onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                />
                <FormTextarea
                    label="Introduction (optional)"
                    dir="auto"
                    rows={3}
                    maxLength={1000}
                    value={draft.intro}
                    error={errors.intro}
                    hint={`${draft.intro.length}/1000`}
                    onChange={(event) => setDraft({ ...draft, intro: event.target.value })}
                />
            </section>

            <ContentListEditor
                field="sections"
                items={draft.sections}
                errors={errors}
                config={SECTION_CONFIG}
                onChange={(sections) => setDraft({ ...draft, sections })}
            />
            <ConfirmDialog {...confirmProps} />
        </div>
    );
}

export default function LegalPage() {
    const { confirm, confirmProps } = useConfirm();
    const [slug, setSlug] = useState('privacy');
    const [dirty, setDirty] = useState(false);

    const switchTab = async (next) => {
        if (next === slug) return;
        if (dirty) {
            const ok = await confirm({
                title: 'Discard unsaved changes?',
                message: 'You have unsaved changes on this page. Switching will discard them.',
                confirmLabel: 'Discard'
            });
            if (!ok) return;
            setDirty(false);
        }
        setSlug(next);
    };

    return (
        <div>
            <PageHeader
                title="Legal pages"
                description="Edit the privacy policy and the terms shown on the public website."
            />

            <div role="tablist" aria-label={t('Legal pages')} className="flex gap-2 mb-5">
                {TABS.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        role="tab"
                        aria-selected={item.id === slug}
                        onClick={() => switchTab(item.id)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition ${item.id === slug
                                ? 'bg-brand-600 text-white shadow-sm'
                                : 'bg-card text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
                            }`}
                    >
                        {t(item.label)}
                    </button>
                ))}
            </div>

            <LegalEditor key={slug} slug={slug} onDirtyChange={setDirty} />
            <ConfirmDialog {...confirmProps} />
        </div>
    );
}