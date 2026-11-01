import { useEffect, useState } from 'react';
import {
    BellOff,
    BellRing,
    CheckCircle2,
    Download,
    Loader2,
    Mail,
    Save,
    Send,
    TriangleAlert
} from 'lucide-react';
import notificationService from '../../services/notification.service';
import useFetch from '../../hooks/useFetch';
import usePush from '../../hooks/usePush';
import useInstall from '../../hooks/useInstall';
import { useToast } from '../../context/ToastContext';
import Loader from '../common/Loader';
import FormInput, { FormToggle } from '../forms/FormInput';
import { isEmail } from '../../utils/validators';
import { t } from '../../i18n';

const IOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

function Notice({ children, tone = 'amber' }) {
    const tones = {
        amber: 'border-amber-200 bg-amber-50 text-amber-800',
        slate: 'border-slate-200 bg-slate-50 text-slate-600'
    };
    return (
        <div className={`flex gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${tones[tone]}`}>
            <TriangleAlert size={18} className="mt-0.5 shrink-0" />
            {children}
        </div>
    );
}

export default function NotificationsPanel() {
    const toast = useToast();
    const { data, loading, refetch } = useFetch(() => notificationService.status(), []);
    const push = usePush(data ? data.publicKey : '');
    const install = useInstall();
    const [form, setForm] = useState(null);
    const [busy, setBusy] = useState('');
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);

    useEffect(() => {
        if (!data) return;
        setForm({
            pushEnabled: data.settings.pushEnabled,
            emailEnabled: data.settings.emailEnabled,
            notifyAllAdmins: data.settings.notifyAllAdmins,
            extra: data.settings.extraRecipients.join(', ')
        });
    }, [data]);

    if ((loading && !data) || !form) return <Loader />;

    const handleEnable = async () => {
        const outcome = await push.enable();
        if (outcome.ok) {
            toast.success('Notifications are on for this device');
            refetch();
        } else if (outcome.reason === 'denied') {
            toast.error('Notifications are blocked. Allow them in your browser settings.');
        } else {
            toast.error(outcome.message || 'Could not turn on notifications');
        }
    };

    const handleDisable = async () => {
        await push.disable();
        toast.success('Notifications turned off for this device');
        refetch();
    };

    const handleSave = async () => {
        const list = form.extra
            .split(/[,،\s]+/)
            .map((item) => item.trim())
            .filter(Boolean);

        if (list.length > 5 || list.some((item) => !isEmail(item))) {
            setError('Enter up to 5 valid email addresses');
            return;
        }

        setError('');
        setBusy('save');
        try {
            await notificationService.updateSettings({
                pushEnabled: form.pushEnabled,
                emailEnabled: form.emailEnabled,
                notifyAllAdmins: form.notifyAllAdmins,
                extraRecipients: list
            });
            toast.success('Notification settings saved');
            refetch();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setBusy('');
        }
    };

    const handleTest = async () => {
        setBusy('test');
        setResult(null);
        try {
            const res = await notificationService.test();
            setResult(res.data);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setBusy('');
        }
    };

    return (
        <section className="p-6 mt-6 space-y-6 card">
            <div>
                <h3 className="text-base font-semibold text-slate-900">{t('New message alerts')}</h3>
                <p className="mt-1 text-sm text-slate-500">
                    {t('Get alerted the moment someone sends a message from the website, on your phone and by email.')}
                </p>
            </div>

            <div className="p-4 space-y-4 border rounded-xl border-slate-200">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                        <BellRing size={18} className="text-brand-600" />
                        {t('App notifications on this device')}
                    </p>
                    {install.installed ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                            <CheckCircle2 size={14} />
                            {t('The app is installed')}
                        </span>
                    ) : (
                        install.canInstall && (
                            <button type="button" className="btn-secondary px-3 py-1.5 text-xs" onClick={install.install}>
                                <Download size={14} />
                                {t('Install the dashboard as an app')}
                            </button>
                        )
                    )}
                </div>

                {!data.pushConfigured && (
                    <Notice>{t('Push keys are missing on the server. Add the VAPID keys to the backend .env file.')}</Notice>
                )}
                {IOS && !install.installed && (
                    <Notice tone="slate">
                        {t('On iPhone: tap Share, then Add to Home Screen, open the app from the home screen, then turn on notifications.')}
                    </Notice>
                )}
                {!push.supported && !IOS && (
                    <Notice tone="slate">{t('This browser does not support app notifications. Use Chrome or Edge.')}</Notice>
                )}
                {push.permission === 'denied' && push.supported && (
                    <Notice>{t('Notifications are blocked. Allow them in your browser settings.')}</Notice>
                )}

                <div className="flex flex-wrap items-center gap-3">
                    {push.subscribed ? (
                        <>
                            <span className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600">
                                <CheckCircle2 size={16} />
                                {t('Notifications are on for this device')}
                            </span>
                            <button type="button" className="btn-secondary" disabled={push.busy} onClick={handleDisable}>
                                <BellOff size={16} />
                                {t('Turn off')}
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            className="btn-primary"
                            disabled={push.busy || !push.supported || !data.pushConfigured}
                            onClick={handleEnable}
                        >
                            {push.busy ? <Loader2 size={16} className="animate-spin" /> : <BellRing size={16} />}
                            {t('Enable on this device')}
                        </button>
                    )}
                </div>
            </div>

            <div className="p-4 space-y-4 border rounded-xl border-slate-200">
                <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Mail size={18} className="text-brand-600" />
                    {t('Email alerts')}
                </p>

                {!data.emailConfigured && (
                    <Notice>{t('Email is not configured on the server. Add the email provider keys to the backend .env file.')}</Notice>
                )}

                <FormToggle
                    label="Send app notifications"
                    checked={form.pushEnabled}
                    onChange={(value) => setForm({ ...form, pushEnabled: value })}
                />
                <FormToggle
                    label="Send an email for every new message"
                    checked={form.emailEnabled}
                    onChange={(value) => setForm({ ...form, emailEnabled: value })}
                />
                <FormToggle
                    label="Also email every active admin"
                    checked={form.notifyAllAdmins}
                    onChange={(value) => setForm({ ...form, notifyAllAdmins: value })}
                />
                <FormInput
                    label="Extra email addresses"
                    dir="ltr"
                    placeholder="owner@example.com, manager@example.com"
                    hint="Separate with commas. Up to 5 addresses."
                    error={error}
                    value={form.extra}
                    onChange={(event) => setForm({ ...form, extra: event.target.value })}
                />
            </div>

            {result && (
                <ul className="space-y-1 text-sm font-medium">
                    {result.push.configured && (
                        <li className={result.push.sent > 0 ? 'text-emerald-600' : 'text-amber-600'}>
                            {result.push.sent > 0
                                ? t('Test notification sent')
                                : t('No device received it. Turn on notifications on this device first.')}
                        </li>
                    )}
                    {result.email.configured && (
                        <li className={result.email.sent ? 'text-emerald-600' : 'text-red-600'}>
                            {result.email.sent
                                ? t('Test email sent')
                                : `${t('Could not send the email')}: ${result.email.error}`}
                        </li>
                    )}
                </ul>
            )}

            <div className="flex flex-wrap justify-end gap-3">
                <button type="button" className="btn-secondary" disabled={Boolean(busy)} onClick={handleTest}>
                    {busy === 'test' ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    {t('Send test')}
                </button>
                <button type="button" className="btn-primary" disabled={Boolean(busy)} onClick={handleSave}>
                    {busy === 'save' ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {t('Save changes')}
                </button>
            </div>
        </section>
    );
}