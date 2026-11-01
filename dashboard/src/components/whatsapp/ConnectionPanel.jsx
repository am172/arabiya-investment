import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Link2, Loader2, LogOut, QrCode, Smartphone } from 'lucide-react';
import whatsappService from '../../services/whatsapp.service';
import useConfirm from '../../hooks/useConfirm';
import { useToast } from '../../context/ToastContext';
import ConfirmDialog from '../common/ConfirmDialog';
import { mapServerErrors } from '../../utils/validators';
import { t } from '../../i18n';

const groupCode = (code) => String(code || '').replace(/(.{4})(?=.)/g, '$1-');

export default function ConnectionPanel() {
    const toast = useToast();
    const { confirm, confirmProps } = useConfirm();
    const [info, setInfo] = useState(null);
    const [mode, setMode] = useState('qr');
    const [phone, setPhone] = useState('');
    const [busy, setBusy] = useState(false);
    const [errors, setErrors] = useState({});
    const status = info ? info.status : '';

    const load = useCallback(async () => {
        try {
            const res = await whatsappService.status();
            setInfo(res.data);
        } catch (error) {
            return;
        }
    }, []);

    useEffect(() => {
        load();
        const slow = status === 'connected' || status === 'disabled';
        const timer = setInterval(load, slow ? 15000 : 2500);
        return () => clearInterval(timer);
    }, [load, status]);

    const handleConnect = async () => {
        setErrors({});
        setBusy(true);
        try {
            const res = await whatsappService.connect({ mode, phone });
            setInfo(res.data);
        } catch (err) {
            setErrors(mapServerErrors(err.errors));
            toast.error(err.message);
        } finally {
            setBusy(false);
        }
    };

    const handleDisconnect = async () => {
        const ok = await confirm({
            title: 'Disconnect WhatsApp',
            message: 'The bot will stop replying and the linked device will be removed.',
            confirmLabel: 'Disconnect'
        });
        if (!ok) return;
        try {
            const res = await whatsappService.disconnect();
            setInfo(res.data);
        } catch (err) {
            toast.error(err.message);
        }
    };

    if (!info) {
        return (
            <div className="flex justify-center py-16">
                <Loader2 className="animate-spin text-brand-600" />
            </div>
        );
    }
    
    if (info.enabled === false) {
        return (
            <section className="flex gap-3 p-6 text-sm card text-slate-600">
                <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-500" />
                {t('The WhatsApp bot is turned off on this server. Set WHATSAPP_ENABLED=true in the backend environment variables to turn it on.')}
            </section>
        );
    }

    const noProvider = !info.providers.groq && !info.providers.gemini;
    const waiting = ['connecting', 'qr', 'pairing'].includes(info.status);

    return (
        <div className="space-y-5">
            {noProvider && (
                <div className="flex gap-3 px-4 py-3 text-sm font-medium border rounded-xl border-amber-200 bg-amber-50 text-amber-800">
                    <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                    {t('No AI key is set on the server. Add GROQ_API_KEY or GEMINI_API_KEY to the backend .env file. Both have free plans.')}
                </div>
            )}

            {/* whatsapp_alert */}
            {/* <div className="flex gap-3 px-4 py-3 text-sm border rounded-xl border-slate-200 bg-slate-50 text-slate-600">
                <AlertTriangle size={18} className="mt-0.5 shrink-0 text-slate-400" />
                {t('This uses an unofficial WhatsApp connection. Use a dedicated number and never send bulk messages, or the number may be banned.')}
            </div> */}

            {info.status === 'connected' && (
                <section className="flex flex-col items-start gap-4 p-6 card sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600">
                            <CheckCircle2 size={24} />
                        </span>
                        <div>
                            <p className="font-semibold text-slate-900">{t('WhatsApp is connected')}</p>
                            <p dir="ltr" className="text-sm text-start text-slate-500">
                                {info.phone ? `+${info.phone}` : ''}
                            </p>
                        </div>
                    </div>
                    <button type="button" className="btn-danger" onClick={handleDisconnect}>
                        <LogOut size={16} />
                        {t('Disconnect')}
                    </button>
                </section>
            )}

            {info.status !== 'connected' && (
                <section className="p-6 card">
                    <div className="flex flex-wrap gap-2 mb-5">
                        {[
                            { id: 'qr', label: 'QR code', icon: QrCode },
                            { id: 'pairing', label: 'Pairing code', icon: Smartphone }
                        ].map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                aria-pressed={mode === item.id}
                                disabled={waiting}
                                onClick={() => setMode(item.id)}
                                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition disabled:opacity-60 ${mode === item.id ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                <item.icon size={16} />
                                {t(item.label)}
                            </button>
                        ))}
                    </div>

                    {mode === 'pairing' && !waiting && (
                        <div className="max-w-sm mb-5">
                            <label className="label">{t('Phone number with country code')}</label>
                            <input
                                dir="ltr"
                                inputMode="numeric"
                                placeholder="201001234567"
                                className={`input ${errors.phone ? 'input-error' : ''}`}
                                value={phone}
                                onChange={(event) => setPhone(event.target.value.replace(/\D/g, ''))}
                            />
                            {errors.phone && <p className="error-text">{t(errors.phone)}</p>}
                        </div>
                    )}

                    {!waiting && (
                        <button type="button" className="btn-primary" disabled={busy} onClick={handleConnect}>
                            {busy ? <Loader2 size={16} className="animate-spin" /> : <Link2 size={16} />}
                            {t('Start linking')}
                        </button>
                    )}

                    {info.status === 'connecting' && (
                        <p className="flex items-center gap-2 text-sm text-slate-500">
                            <Loader2 size={16} className="animate-spin" />
                            {t('Connecting...')}
                        </p>
                    )}

                    {info.status === 'qr' && info.qr && (
                        <div className="flex flex-col items-center gap-5 mt-2 sm:flex-row sm:items-start">
                            <img
                                src={info.qr}
                                alt=""
                                className="p-2 border h-60 w-60 rounded-2xl border-slate-200"
                                style={{ background: '#ffffff' }}
                            />
                            <ol className="space-y-2 text-sm list-decimal ps-5 text-slate-600">
                                <li>{t('Open WhatsApp on the phone')}</li>
                                <li>{t('Go to Settings, then Linked devices')}</li>
                                <li>{t('Tap Link a device and scan this code')}</li>
                            </ol>
                        </div>
                    )}

                    {info.status === 'pairing' && info.pairingCode && (
                        <div className="mt-2 space-y-4">
                            <p dir="ltr" className="font-mono text-4xl font-bold tracking-widest text-start text-slate-900">
                                {groupCode(info.pairingCode)}
                            </p>
                            <ol className="space-y-2 text-sm list-decimal ps-5 text-slate-600">
                                <li>{t('Open WhatsApp on the phone')}</li>
                                <li>{t('Go to Settings, then Linked devices')}</li>
                                <li>{t('Tap Link a device, then Link with phone number instead')}</li>
                                <li>{t('Enter the code above')}</li>
                            </ol>
                        </div>
                    )}

                    {info.error && <p className="mt-4 error-text">{info.error}</p>}
                </section>
            )}
            <ConfirmDialog {...confirmProps} />
        </div>
    );
}