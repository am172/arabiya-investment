import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ImagePlus, Loader2, Star, Trash2 } from 'lucide-react';
import uploadService from '../../services/upload.service';
import { useToast } from '../../context/ToastContext';
import { IMAGE_MAX, LIMITS } from '../../constants/catalog';
import { thumb } from '../../utils/catalog';
import uid from '../../utils/uid';
import { t } from '../../i18n';

const TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export default function GalleryEditor({ items, onChange }) {
    const toast = useToast();
    const inputRef = useRef(null);
    const [pending, setPending] = useState([]);
    const [dragFrom, setDragFrom] = useState(null);

    const handleFiles = async (event) => {
        const files = Array.from(event.target.files || []);
        event.target.value = '';

        const room = Math.max(0, LIMITS.gallery - items.length - pending.length);
        if (files.length > room) toast.error('Maximum number of images reached');

        const valid = files.slice(0, room).filter((file) => {
            const ok = TYPES.includes(file.type) && file.size <= IMAGE_MAX;
            if (!ok) toast.error('Only JPG, PNG, WebP or GIF images up to 5 MB are allowed');
            return ok;
        });

        const jobs = valid.map((file) => ({ id: uid(), name: file.name, progress: 0, file }));
        setPending(jobs.map(({ file, ...rest }) => rest));

        for (const job of jobs) {
            try {
                const res = await uploadService.uploadImage(job.file, 'catalog', (progress) =>
                    setPending((current) => current.map((item) => (item.id === job.id ? { ...item, progress } : item)))
                );
                onChange((current) => [
                    ...current,
                    { _uid: uid(), url: res.data.url, publicId: res.data.publicId, alt: '', isCover: current.length === 0 }
                ]);
            } catch (err) {
                toast.error(err.message);
            }
            setPending((current) => current.filter((item) => item.id !== job.id));
        }
    };

    const move = (from, to) => {
        if (from === null || from === to || to < 0 || to >= items.length) return;
        const next = [...items];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        onChange(next);
    };

    const setCover = (index) => onChange(items.map((item, position) => ({ ...item, isCover: position === index })));

    const remove = (index) => {
        const next = items.filter((_, position) => position !== index);
        if (next.length > 0 && !next.some((item) => item.isCover)) next[0] = { ...next[0], isCover: true };
        onChange(next);
    };

    const patch = (index, change) => onChange(items.map((item, position) => (position === index ? { ...item, ...change } : item)));

    return (
        <div>
            <input ref={inputRef} type="file" multiple accept={TYPES.join(',')} className="hidden" onChange={handleFiles} />

            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {items.map((item, index) => (
                    <li
                        key={item._uid}
                        draggable
                        onDragStart={() => setDragFrom(index)}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={() => {
                            move(dragFrom, index);
                            setDragFrom(null);
                        }}
                        onDragEnd={() => setDragFrom(null)}
                        className={`overflow-hidden rounded-xl border bg-card ${item.isCover ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-slate-200'
                            } ${dragFrom === index ? 'opacity-40' : ''}`}
                    >
                        <div className="relative aspect-square bg-slate-100">
                            <img src={thumb(item.url, 400)} alt={item.alt} className="object-cover w-full h-full" />
                            {item.isCover && (
                                <span className="absolute start-2 top-2 rounded-full bg-brand-600 px-2 py-0.5 text-[11px] font-bold text-white">
                                    {t('Cover')}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center justify-between gap-1 px-2 pt-2">
                            <button
                                type="button"
                                className="icon-btn h-7 w-7"
                                title={t('Set as cover')}
                                onClick={() => setCover(index)}
                            >
                                <Star size={15} className={item.isCover ? 'fill-amber-400 text-amber-500' : ''} />
                            </button>
                            <div className="flex items-center">
                                <button
                                    type="button"
                                    className="icon-btn h-7 w-7 disabled:opacity-30 rtl:rotate-180"
                                    disabled={index === 0}
                                    title={t('Earlier')}
                                    onClick={() => move(index, index - 1)}
                                >
                                    <ChevronLeft size={15} />
                                </button>
                                <button
                                    type="button"
                                    className="icon-btn h-7 w-7 disabled:opacity-30 rtl:rotate-180"
                                    disabled={index === items.length - 1}
                                    title={t('Later')}
                                    onClick={() => move(index, index + 1)}
                                >
                                    <ChevronRight size={15} />
                                </button>
                            </div>
                            <button
                                type="button"
                                className="icon-btn h-7 w-7 hover:bg-red-50 hover:text-red-600"
                                title={t('Remove')}
                                onClick={() => remove(index)}
                            >
                                <Trash2 size={15} />
                            </button>
                        </div>
                        <div className="p-2">
                            <input
                                dir="auto"
                                className="input py-1.5 text-xs"
                                placeholder={t('Alt text (optional)')}
                                maxLength={200}
                                value={item.alt}
                                onChange={(event) => patch(index, { alt: event.target.value })}
                            />
                        </div>
                    </li>
                ))}

                {pending.map((job) => (
                    <li key={job.id} className="flex flex-col items-center justify-center gap-2 p-3 border border-dashed aspect-square rounded-xl border-slate-300">
                        <Loader2 size={22} className="animate-spin text-brand-600" />
                        <span className="text-xs font-semibold text-slate-600">{job.progress}%</span>
                    </li>
                ))}

                {items.length + pending.length < LIMITS.gallery && (
                    <li>
                        <button
                            type="button"
                            onClick={() => inputRef.current && inputRef.current.click()}
                            className="flex flex-col items-center justify-center w-full gap-2 transition border border-dashed aspect-square rounded-xl border-slate-300 text-slate-500 hover:border-brand-400 hover:bg-brand-50 hover:text-brand-600"
                        >
                            <ImagePlus size={26} />
                            <span className="text-xs font-semibold">{t('Upload images')}</span>
                        </button>
                    </li>
                )}
            </ul>

            {items.length === 0 && pending.length === 0 && <p className="hint">{t('No images yet')}</p>}
        </div>
    );
}