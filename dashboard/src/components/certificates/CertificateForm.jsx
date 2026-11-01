import { useEffect, useMemo, useState } from 'react';
import FormInput, { FormActions } from '../forms/FormInput';
import FormTextarea from '../forms/FormTextarea';
import TemplatePicker from './TemplatePicker';
import useQr from './useQr';
import { SITE_URL } from '../../constants/config';
import { mapServerErrors } from '../../utils/validators';
import { todayInput } from '../../utils/analytics';
import { resolveTemplate } from '../../utils/certificateTheme';
import { t } from '../../i18n';

const day = (value) => (value ? new Date(value).toISOString().slice(0, 10) : '');

const toForm = (data, settings) => ({
    studentName: data ? data.studentName : '',
    courseName: data ? data.courseName : '',
    hours: data && data.hours != null ? String(data.hours) : '',
    grade: data ? data.grade || '' : '',
    issueDate: data ? day(data.issueDate) : todayInput(),
    completionDate: data ? day(data.completionDate) : '',
    notes: data ? data.notes || '' : '',
    template: resolveTemplate(data, settings)
});

export default function CertificateForm({
    initialData,
    settings,
    site,
    onSubmit,
    onCancel,
    submitting,
    serverErrors
}) {
    const [form, setForm] = useState(() => toForm(initialData, settings));
    const [errors, setErrors] = useState({});

    const base = SITE_URL || window.location.origin;
    const code = initialData ? initialData.code : 'XXXX-XXXX-XXXX';
    const verifyUrl = `${base}/verify/${code}`;
    const qr = useQr(verifyUrl);

    useEffect(() => {
        setErrors(mapServerErrors(serverErrors));
    }, [serverErrors]);

    const draft = useMemo(
        () => ({
            studentName: form.studentName.trim() || t('Student name'),
            courseName: form.courseName.trim() || t('Course name'),
            hours: form.hours === '' ? null : Number(form.hours),
            grade: form.grade.trim(),
            issueDate: form.issueDate || new Date().toISOString(),
            completionDate: form.completionDate || null,
            serial: initialData ? initialData.serial : 'CERT-0000-00000',
            code
        }),
        [form, initialData, code]
    );

    const bind = (name) => ({
        value: form[name],
        error: errors[name],
        onChange: (event) => setForm({ ...form, [name]: event.target.value })
    });

    const handleSubmit = (event) => {
        event.preventDefault();
        const found = {};
        if (!form.studentName.trim()) found.studentName = 'Name is required';
        if (!form.courseName.trim()) found.courseName = 'Course name is required';
        if (!form.issueDate) found.issueDate = 'Issue date is required';
        setErrors(found);
        if (Object.keys(found).length > 0) return;

        onSubmit({
            studentName: form.studentName.trim(),
            courseName: form.courseName.trim(),
            hours: form.hours === '' ? null : Number(form.hours),
            grade: form.grade.trim(),
            issueDate: form.issueDate,
            completionDate: form.completionDate,
            notes: form.notes.trim(),
            template: form.template
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <FormInput label="Student name" dir="auto" maxLength={120} {...bind('studentName')} />
            <FormInput label="Course name" dir="auto" maxLength={150} {...bind('courseName')} />
            <div className="grid gap-4 sm:grid-cols-2">
                <FormInput label="Issue date" type="date" {...bind('issueDate')} />
                <FormInput label="Completion date (optional)" type="date" {...bind('completionDate')} />
                <FormInput label="Hours (optional)" type="number" min="0" {...bind('hours')} />
                <FormInput label="Grade (optional)" dir="auto" maxLength={40} {...bind('grade')} />
            </div>

            <div>
                <p className="label">{t('Certificate theme')}</p>
                <p className="mb-3 text-xs text-slate-500">
                    {t('Each preview updates as you type. Colors follow your website brand unless changed in Certificate settings.')}
                </p>
                <TemplatePicker
                    value={form.template}
                    onChange={(template) => setForm({ ...form, template })}
                    cert={draft}
                    settings={settings}
                    site={site}
                    qr={qr}
                    verifyUrl={verifyUrl}
                />
            </div>

            <FormTextarea
                label="Private notes"
                dir="auto"
                rows={2}
                hint="Only visible to admins. Not printed on the certificate."
                {...bind('notes')}
            />
            <div className="flex justify-end gap-3 pt-2">
                <button type="button" className="btn-secondary" onClick={onCancel}>
                    {t('Cancel')}
                </button>
                <FormActions submitting={submitting} submitLabel="Save and preview" />
            </div>
        </form>
    );
}