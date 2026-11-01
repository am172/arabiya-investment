import { useEffect, useRef, useState } from 'react';
import { Check, Copy, Download, Loader2, Send } from 'lucide-react';
import Modal from '../common/Modal';
import CertificateView from './CertificateView';
import ScaledCertificate from './ScaledCertificate';
import useQr from './useQr';
import certificateService from '../../services/certificate.service';
import whatsappService from '../../services/whatsapp.service';
import { TEMPLATES } from '../../constants/certificateTemplates';
import { SITE_URL } from '../../constants/config';
import { certificatePdfBlob, downloadCertificatePdf } from '../../utils/certificatePdf';
import { resolveTemplate } from '../../utils/certificateTheme';
import { useToast } from '../../context/ToastContext';
import { t } from '../../i18n';

export default function CertificatePreview({ cert, settings, site, onClose }) {
    const toast = useToast();
    const exportRef = useRef(null);
    const [template, setTemplate] = useState('classic');
    const [busy, setBusy] = useState(false);
    const [sending, setSending] = useState(false);
    const [copied, setCopied] = useState(false);
    const [phone, setPhone] = useState('');
    const [waStatus, setWaStatus] = useState('');

    const base = SITE_URL || window.location.origin;
    const verifyUrl = cert ? `${base}/verify/${cert.code}` : '';
    const qr = useQr(verifyUrl);
    const connected = waStatus === 'connected';

    useEffect(() => {
        if (!cert) return;
        setTemplate(resolveTemplate(cert, settings));
        setPhone('');
        whatsappService
            .status()
            .then((res) => setWaStatus(res.data.status))
            .catch(() => setWaStatus(''));
    }, [cert]);

    const handleDownload = async () => {
        if (!exportRef.current) return;
        setBusy(true);
        try {
            await downloadCertificatePdf(exportRef.current, `${cert.serial}.pdf`);
        } catch (error) {
            toast.error('Could not create the PDF');
        } finally {
            setBusy(false);
        }
    };

    const handleSend = async () => {
        if (!exportRef.current) return;
        setSending(true);
        try {
            const blob = await certificatePdfBlob(exportRef.current);
            await certificateService.sendWhatsApp(cert._id, blob, phone, `${cert.serial}.pdf`);
            toast.success('Certificate sent on WhatsApp');
        } catch (err) {
            toast.error(err.message || 'Could not send the certificate');
        } finally {
            setSending(false);
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(verifyUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            toast.error('Could not copy the link');
        }
    };

    const view = (
        <CertificateView
            cert={cert || {}}
            settings={settings}
            site={site}
            qr={qr}
            verifyUrl={verifyUrl}
            template={template}
        />
    );

    return (
        <Modal open={Boolean(cert)} onClose={onClose} title="Certificate" size="lg">
            {cert && (
                <div className="space-y-4">
                    <div role="radiogroup" aria-label={t('Certificate theme')} className="flex flex-wrap gap-2">
                        {TEMPLATES.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                role="radio"
                                aria-checked={template === item.id}
                                onClick={() => setTemplate(item.id)}
                                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${template === item.id
                                        ? 'bg-brand-600 text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                {t(item.label)}
                            </button>
                        ))}
                    </div>

                    <ScaledCertificate className="border rounded-xl border-slate-200">{view}</ScaledCertificate>

                    <div aria-hidden="true" style={{ position: 'fixed', left: -10000, top: 0 }}>
                        <div ref={exportRef}>{view}</div>
                    </div>

                    {!SITE_URL && (
                        <p className="text-xs text-amber-600">
                            {t('VITE_SITE_URL is not set, so the QR code points to this dashboard address. Set it to your public website address.')}
                        </p>
                    )}

                    <div className="flex flex-wrap justify-end gap-3">
                        <button type="button" className="btn-secondary" onClick={handleCopy}>
                            {copied ? <Check size={16} /> : <Copy size={16} />}
                            {t('Copy verification link')}
                        </button>
                        <button type="button" className="btn-primary" disabled={busy || !qr} onClick={handleDownload}>
                            {busy ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                            {t('Download PDF')}
                        </button>
                    </div>

                    {cert.status === 'valid' && (
                        <div className="p-4 border rounded-xl border-slate-200">
                            <p className="mb-3 text-sm font-semibold text-slate-900">{t('Send via WhatsApp')}</p>
                            {connected ? (
                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <input
                                        dir="ltr"
                                        inputMode="numeric"
                                        className="flex-1 input"
                                        placeholder="201001234567"
                                        value={phone}
                                        onChange={(event) => setPhone(event.target.value.replace(/\D/g, ''))}
                                    />
                                    <button
                                        type="button"
                                        className="btn-primary"
                                        disabled={sending || !qr || phone.length < 8}
                                        onClick={handleSend}
                                    >
                                        {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} className="rtl:-scale-x-100" />}
                                        {t('Send certificate')}
                                    </button>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500">
                                    {t('WhatsApp is not connected. Link a number first from the WhatsApp bot page.')}
                                </p>
                            )}
                            {connected && (
                                <p className="hint">
                                    {t('Enter the full number with the country code. Send only to people who asked for their certificate.')}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
}