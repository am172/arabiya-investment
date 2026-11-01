import { useEffect, useMemo, useState } from 'react';
import FormInput, { FormActions, FormToggle } from '../forms/FormInput';
import Modal from '../common/Modal';
import ImageUploader from '../common/ImageUploader';
import ColorPicker from '../theme/ColorPicker';
import TemplatePicker from './TemplatePicker';
import useQr from './useQr';
import { SITE_URL } from '../../constants/config';
import { normalizeHex } from '../../utils/color';
import { sampleCertificate } from '../../utils/certificateTheme';
import { t } from '../../i18n';

const EMPTY = { url: '', publicId: '' };

export default function CertificateSettingsModal({ open, settings, site, onClose, onSave, saving }) {
    const [form, setForm] = useState(null);
    const sample = useMemo(sampleCertificate, []);
    const verifyUrl = `${SITE_URL || window.location.origin}/verify/${sample.code}`;
    const qr = useQr(verifyUrl);

    useEffect(() => {
        if (!settings) return;
        setForm({
            prefix: settings.prefix,
            title: settings.title,
            intro: settings.intro,
            bodyLine: settings.bodyLine,
            signerName: settings.signerName,
            signerTitle: settings.signerTitle,
            footerNote: settings.footerNote,
            signature: settings.signature ? { url: settings.signature.url, publicId: settings.signature.publicId } : EMPTY,
            defaultTemplate: settings.defaultTemplate || 'classic',
            useBrandColors: settings.useBrandColors !== false,
            primaryColor: normalizeHex(settings.primaryColor, normalizeHex(site && site.primary)),
            secondaryColor: normalizeHex(settings.secondaryColor, normalizeHex(site && site.secondary, '#f59e0b'))
        });
    }, [settings, site, open]);

    if (!form) return null;

    const bind = (name) => ({
        value: form[name],
        onChange: (event) => setForm({ ...form, [name]: event.target.value })
    });

    const live = {
        ...settings,
        title: form.title || settings.title,
        intro: form.intro,
        bodyLine: form.bodyLine,
        signerName: form.signerName,
        signerTitle: form.signerTitle,
        footerNote: form.footerNote,
        signature: form.signature,
        useBrandColors: form.useBrandColors,
        primaryColor: form.primaryColor,
        secondaryColor: form.secondaryColor
    };

    return (
        <Modal open={open} onClose={onClose} title="Certificate settings" size="lg">
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    onSave({
                        prefix: form.prefix.trim(),
                        title: form.title.trim(),
                        intro: form.intro.trim(),
                        bodyLine: form.bodyLine.trim(),
                        signerName: form.signerName.trim(),
                        signerTitle: form.signerTitle.trim(),
                        footerNote: form.footerNote.trim(),
                        signature: form.signature,
                        defaultTemplate: form.defaultTemplate,
                        useBrandColors: form.useBrandColors,
                        primaryColor: form.useBrandColors ? '' : form.primaryColor,
                        secondaryColor: form.useBrandColors ? '' : form.secondaryColor
                    });
                }}
                className="space-y-5"
            >
                <section className="space-y-4">
                    <h4 className="text-sm font-semibold text-slate-900">{t('Default theme')}</h4>
                    <TemplatePicker
                        value={form.defaultTemplate}
                        onChange={(defaultTemplate) => setForm({ ...form, defaultTemplate })}
                        cert={sample}
                        settings={live}
                        site={site}
                        qr={qr}
                        verifyUrl={verifyUrl}
                    />
                </section>

                <section className="p-4 space-y-4 border rounded-xl border-slate-200">
                    <h4 className="text-sm font-semibold text-slate-900">{t('Colors')}</h4>
                    <FormToggle
                        label="Use the website brand colors"
                        hint="The certificate follows the main colors of your website theme and updates when you change them."
                        checked={form.useBrandColors}
                        onChange={(value) => setForm({ ...form, useBrandColors: value })}
                    />
                    {form.useBrandColors ? (
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                            <span
                                className="border rounded-full h-7 w-7 border-slate-200"
                                style={{ background: site && site.primary }}
                            />
                            <span
                                className="border rounded-full h-7 w-7 border-slate-200"
                                style={{ background: site && site.secondary }}
                            />
                            {t('Current website colors')}
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                            <ColorPicker
                                label="Main color"
                                value={form.primaryColor}
                                onChange={(value) => setForm({ ...form, primaryColor: value })}
                            />
                            <ColorPicker
                                label="Accent color"
                                value={form.secondaryColor}
                                onChange={(value) => setForm({ ...form, secondaryColor: value })}
                            />
                        </div>
                    )}
                </section>

                <FormInput
                    label="Serial prefix"
                    dir="ltr"
                    maxLength={8}
                    hint="2 to 8 letters or digits, for example NBR"
                    {...bind('prefix')}
                />
                <FormInput label="Certificate title" dir="auto" maxLength={80} {...bind('title')} />
                <div className="grid gap-4 sm:grid-cols-2">
                    <FormInput label="Line above the student name" dir="auto" maxLength={120} {...bind('intro')} />
                    <FormInput label="Line below the student name" dir="auto" maxLength={120} {...bind('bodyLine')} />
                    <FormInput label="Signer name" dir="auto" maxLength={80} {...bind('signerName')} />
                    <FormInput label="Signer title" dir="auto" maxLength={80} {...bind('signerTitle')} />
                </div>
                <FormInput label="Footer note" dir="auto" maxLength={200} {...bind('footerNote')} />
                <ImageUploader
                    label="Signature image (optional)"
                    folder="branding"
                    value={form.signature}
                    onChange={(asset) => setForm({ ...form, signature: { url: asset.url, publicId: asset.publicId } })}
                    onRemove={() => setForm({ ...form, signature: EMPTY })}
                    hint="Transparent PNG works best"
                />
                <div className="flex justify-end gap-3 pt-2">
                    <button type="button" className="btn-secondary" onClick={onClose}>
                        {t('Cancel')}
                    </button>
                    <FormActions submitting={saving} submitLabel="Save settings" />
                </div>
            </form>
        </Modal>
    );
}