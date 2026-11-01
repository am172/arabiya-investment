import { useEffect, useState } from 'react';
import { Loader2, Mail, MessageCircle, Phone, Save, Trash2 } from 'lucide-react';
import requestService from '../../services/request.service';
import useFetch from '../../hooks/useFetch';
import useConfirm from '../../hooks/useConfirm';
import { useToast } from '../../context/ToastContext';
import Modal from '../common/Modal';
import Loader from '../common/Loader';
import ConfirmDialog from '../common/ConfirmDialog';
import RequestStatusBadge from './RequestStatusBadge';
import { REQUEST_STATUSES } from '../../constants/catalog';
import { formatDateTime } from '../../utils/formatters';
import { thumb } from '../../utils/catalog';
import { t } from '../../i18n';

const whatsappLink = (phone) => {
    const raw = String(phone || '').trim();
    if (!/^(\+|00)/.test(raw)) return '';
    return `https://wa.me/${raw.replace(/\D/g, '').replace(/^00/, '')}`;
};

export default function RequestDetail({ id, onClose, onChanged }) {
    const toast = useToast();
    const { confirm, confirmProps } = useConfirm();
    const { data, loading, refetch } = useFetch(() => requestService.get(id), [id]);
    const [status, setStatus] = useState('');
    const [note, setNote] = useState('');
    const [adminNote, setAdminNote] = useState('');
    const [busy, setBusy] = useState('');

    useEffect(() => {
        if (!data) return;
        setStatus(data.status);
        setAdminNote(data.adminNote || '');
        window.dispatchEvent(new Event('requests:changed'));
    }, [data]);

    const close = () => {
        onChanged();
        onClose();
    };

    const saveStatus = async () => {
        setBusy('status');
        try {
            await requestService.updateStatus(id, { status, note });
            toast.success('Status updated successfully');
            setNote('');
            refetch();
            onChanged();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setBusy('');
        }
    };

    const saveNote = async () => {
        setBusy('note');
        try {
            await requestService.updateNote(id, adminNote);
            toast.success('Note saved successfully');
            refetch();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setBusy('');
        }
    };

    const remove = async () => {
        const ok = await confirm({
            title: 'Delete request',
            message: 'This request will be permanently deleted.',
            confirmLabel: 'Delete'
        });
        if (!ok) return;
        try {
            await requestService.remove(id);
            toast.success('Request deleted successfully');
            close();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const wa = data ? whatsappLink(data.phone) : '';

    return (
        <Modal open onClose={close} title="Request details" size="lg">
            {loading && !data ? (
                <Loader />
            ) : (
                data && (
                    <div className="space-y-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p dir="ltr" className="font-mono text-sm font-bold text-start text-slate-900">
                                    {data.reference}
                                </p>
                                <p className="text-xs text-slate-500">{formatDateTime(data.createdAt)}</p>
                            </div>
                            <RequestStatusBadge status={data.status} />
                        </div>

                        <section className="p-4 border rounded-xl border-slate-200">
                            <div className="grid gap-4 text-sm sm:grid-cols-2">
                                {[
                                    ['Name', data.name],
                                    ['Company', data.company],
                                    ['City', data.city]
                                ].map(([label, value]) => (
                                    <div key={label}>
                                        <p className="text-xs text-slate-400">{t(label)}</p>
                                        <p dir="auto" className="font-medium text-slate-900">
                                            {value || '—'}
                                        </p>
                                    </div>
                                ))}
                                <div>
                                    <p className="text-xs text-slate-400">{t('Phone')}</p>
                                    <p dir="ltr" className="font-medium text-start text-slate-900">
                                        {data.phone}
                                    </p>
                                </div>
                                <div className="sm:col-span-2">
                                    <p className="text-xs text-slate-400">{t('Email')}</p>
                                    <p dir="ltr" className="font-medium text-start text-slate-900">
                                        {data.email || '—'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-4">
                                <a href={`tel:${data.phone}`} className="btn-secondary px-3 py-1.5 text-xs">
                                    <Phone size={14} />
                                    {t('Call')}
                                </a>
                                {wa && (
                                    <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-secondary px-3 py-1.5 text-xs">
                                        <MessageCircle size={14} />
                                        WhatsApp
                                    </a>
                                )}
                                {data.email && (
                                    <a href={`mailto:${data.email}`} className="btn-secondary px-3 py-1.5 text-xs">
                                        <Mail size={14} />
                                        {t('Email')}
                                    </a>
                                )}
                            </div>
                        </section>

                        <section className="space-y-3">
                            <h4 className="text-sm font-semibold text-slate-900">{t('Requested items')}</h4>
                            {data.items.map((item, index) => (
                                <div key={`${item.productSlug}-${index}`} className="p-4 border rounded-xl border-slate-200">
                                    <div className="flex items-start gap-3">
                                        {item.image ? (
                                            <img src={thumb(item.image, 120)} alt="" className="object-cover rounded-lg h-14 w-14 shrink-0 bg-slate-100" />
                                        ) : (
                                            <span className="rounded-lg h-14 w-14 shrink-0 bg-slate-100" />
                                        )}
                                        <div className="min-w-0">
                                            <p dir="auto" className="font-semibold text-slate-900">
                                                {item.productName}
                                            </p>
                                            <p dir="auto" className="text-xs text-slate-500">
                                                {[...item.path, item.sku].filter(Boolean).join(' › ')}
                                            </p>
                                        </div>
                                    </div>

                                    {item.options.length === 0 ? (
                                        <p className="mt-3 text-xs text-slate-400">{t('No options selected')}</p>
                                    ) : (
                                        <dl className="px-4 mt-4 divide-y divide-slate-100 rounded-xl bg-slate-50">
                                            {item.options.map((option) => (
                                                <div key={option.optionKey} className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                                                    <dt dir="auto" className="text-sm text-slate-500">
                                                        {option.title}
                                                    </dt>
                                                    <dd dir="auto" className="text-sm font-semibold text-slate-900 sm:text-end">
                                                        {option.display}
                                                    </dd>
                                                </div>
                                            ))}
                                        </dl>
                                    )}
                                    {item.note && (
                                        <p dir="auto" className="mt-3 text-sm whitespace-pre-wrap text-slate-600">
                                            {item.note}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </section>

                        {data.message && (
                            <section>
                                <h4 className="mb-2 text-sm font-semibold text-slate-900">{t('Customer message')}</h4>
                                <p dir="auto" className="p-4 text-sm whitespace-pre-wrap rounded-xl bg-slate-50 text-slate-700">
                                    {data.message}
                                </p>
                            </section>
                        )}

                        <section className="p-4 border rounded-xl border-slate-200">
                            <h4 className="mb-3 text-sm font-semibold text-slate-900">{t('Update status')}</h4>
                            <div className="flex flex-wrap gap-2">
                                {REQUEST_STATUSES.map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        aria-pressed={status === item.id}
                                        onClick={() => setStatus(item.id)}
                                        className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${status === item.id ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                    >
                                        {t(item.label)}
                                    </button>
                                ))}
                            </div>
                            <div className="flex flex-col gap-3 mt-3 sm:flex-row">
                                <input
                                    dir="auto"
                                    className="input"
                                    maxLength={500}
                                    placeholder={t('Note about this change (optional)')}
                                    value={note}
                                    onChange={(event) => setNote(event.target.value)}
                                />
                                <button
                                    type="button"
                                    className="btn-primary shrink-0"
                                    disabled={busy === 'status' || (status === data.status && !note.trim())}
                                    onClick={saveStatus}
                                >
                                    {busy === 'status' && <Loader2 size={16} className="animate-spin" />}
                                    {t('Update status')}
                                </button>
                            </div>

                            <ol className="mt-4 space-y-2 border-s border-slate-200 ps-4">
                                {[...data.statusHistory].reverse().map((entry, index) => (
                                    <li key={`${entry.at}-${index}`} className="text-xs text-slate-500">
                                        <RequestStatusBadge status={entry.status} />
                                        <span className="ms-2">{formatDateTime(entry.at)}</span>
                                        {entry.byName && <span className="ms-2">· {entry.byName}</span>}
                                        {entry.note && (
                                            <p dir="auto" className="mt-1 text-slate-600">
                                                {entry.note}
                                            </p>
                                        )}
                                    </li>
                                ))}
                            </ol>
                        </section>

                        <section>
                            <label className="label" htmlFor="admin-note">
                                {t('Internal note')}
                            </label>
                            <textarea
                                id="admin-note"
                                dir="auto"
                                rows={3}
                                maxLength={2000}
                                className="resize-y input"
                                placeholder={t('Only visible to admins')}
                                value={adminNote}
                                onChange={(event) => setAdminNote(event.target.value)}
                            />
                            <div className="flex justify-end mt-2">
                                <button type="button" className="btn-secondary" disabled={busy === 'note' || adminNote === (data.adminNote || '')} onClick={saveNote}>
                                    {busy === 'note' ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    {t('Save note')}
                                </button>
                            </div>
                        </section>

                        <div className="flex justify-end pt-4 border-t border-slate-100">
                            <button type="button" className="btn-danger" onClick={remove}>
                                <Trash2 size={16} />
                                {t('Delete')}
                            </button>
                        </div>
                    </div>
                )
            )}
            <ConfirmDialog {...confirmProps} />
        </Modal>
    );
}