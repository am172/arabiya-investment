import { useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ExternalLink, FileText, Loader2, Plus, Trash2 } from 'lucide-react';
import uploadService from '../../services/upload.service';
import { useToast } from '../../context/ToastContext';
import { DOC_MAX, LIMITS } from '../../constants/catalog';
import uid from '../../utils/uid';
import { t } from '../../i18n';

const size = (bytes) => (bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

export default function DocumentsEditor({ items, onChange, errors = {} }) {
    const toast = useToast();
    const inputRef = useRef(null);
    const [progress, setProgress] = useState(null);

    const handleFile = async (event) => {
        const file = event.target.files && event.target.files[0];
        event.target.value = '';
        if (!file) return;
        if (file.type !== 'application/pdf' || file.size > DOC_MAX) {
            toast.error('Only PDF files up to 10 MB are allowed');
            return;
        }

        setProgress(0);
        try {
            const res = await uploadService.uploadDocument(file, 'documents', setProgress);
            onChange((current) => [
                ...current,
                {
                    _uid: uid(),
                    title: file.name.replace(/\.pdf$/i, ''),
                    url: res.data.url,
                    publicId: res.data.publicId,
                    resourceType: res.data.resourceType || 'raw',
                    format: 'pdf',
                    bytes: res.data.bytes || file.size
                }
            ]);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setProgress(null);
        }
    };

    const patch = (id, change) => onChange(items.map((item) => (item._uid === id ? { ...item, ...change } : item)));

    const move = (index, delta) => {
        const target = index + delta;
        if (target < 0 || target >= items.length) return;
        const next = [...items];
        [next[index], next[target]] = [next[target], next[index]];
        onChange(next);
    };

    return (
        <div>
            <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={handleFile} />

            {items.length === 0 && <p className="mb-3 text-sm text-slate-400">{t('No documents yet')}</p>}

            <ul className="space-y-2">
                {items.map((item, index) => (
                    <li key={item._uid} className="flex items-center gap-3 p-3 border rounded-xl border-slate-200">
                        <span className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0 bg-rose-50 text-rose-600">
                            <FileText size={18} />
                        </span>
                        <div className="flex-1 min-w-0">
                            <input
                                dir="auto"
                                className={`input py-2 ${errors[`documents[${index}]`] || errors[`documents[${index}].title`] ? 'input-error' : ''}`}
                                placeholder={t('Document title')}
                                maxLength={150}
                                value={item.title}
                                onChange={(event) => patch(item._uid, { title: event.target.value })}
                            />
                            <p dir="ltr" className="mt-1 text-start text-[11px] text-slate-400">
                                PDF · {size(item.bytes)}
                            </p>
                        </div>
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="icon-btn" title={t('Open')}>
                            <ExternalLink size={15} />
                        </a>
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
                        <button
                            type="button"
                            className="icon-btn hover:bg-red-50 hover:text-red-600"
                            title={t('Remove')}
                            onClick={() => onChange(items.filter((doc) => doc._uid !== item._uid))}
                        >
                            <Trash2 size={15} />
                        </button>
                    </li>
                ))}
            </ul>

            <button
                type="button"
                className="mt-3 btn-secondary"
                disabled={progress !== null || items.length >= LIMITS.documents}
                onClick={() => inputRef.current && inputRef.current.click()}
            >
                {progress !== null ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                {progress !== null ? `${progress}%` : t('Upload PDF')}
            </button>
        </div>
    );
}