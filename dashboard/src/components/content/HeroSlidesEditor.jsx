import { useState } from 'react';
import { ArrowDown, ArrowUp, ChevronDown, Image as ImageIcon, Info, Plus, Trash2 } from 'lucide-react';
import FormInput from '../forms/FormInput';
import FormSelect from '../forms/FormSelect';
import FormTextarea from '../forms/FormTextarea';
import ImageUploader from '../common/ImageUploader';
import Switch from '../common/Switch';
import uid from '../../utils/uid';
import { t } from '../../i18n';

const MAX_SLIDES = 8;
const EMPTY_IMAGE = { url: '', publicId: '' };
const EFFECTS = [
    { value: 'fade', label: 'Fade' },
    { value: 'slide', label: 'Slide' }
];
const CTAS = [
    { key: 'primaryCta', title: 'Primary button' },
    { key: 'secondaryCta', title: 'Secondary button' }
];

const emptySlide = () => ({
    _uid: uid(),
    isActive: true,
    company: '',
    logo: EMPTY_IMAGE,
    eyebrow: '',
    title: '',
    description: '',
    image: EMPTY_IMAGE,
    primaryCta: { label: '', href: '' },
    secondaryCta: { label: '', href: '' }
});

function SliderSettings({ slider, onChange }) {
    const set = (key, value) => onChange({ ...slider, [key]: value });

    const toggle = (key, label) => (
        <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-slate-50">
            <p className="text-sm font-medium text-slate-800">{t(label)}</p>
            <Switch checked={slider[key]} label={t(label)} onChange={(value) => set(key, value)} />
        </div>
    );

    return (
        <div className="grid gap-4 p-4 border rounded-xl border-slate-200 sm:grid-cols-2">
            {toggle('autoplay', 'Autoplay')}
            <FormSelect
                label="Transition effect"
                options={EFFECTS}
                value={slider.effect}
                onChange={(event) => set('effect', event.target.value)}
            />
            <div className="sm:col-span-2">
                <label htmlFor="slider-interval" className="label">
                    {t('Change slide every {n} seconds', { n: slider.interval })}
                </label>
                <input
                    id="slider-interval"
                    type="range"
                    min="3"
                    max="20"
                    step="1"
                    disabled={!slider.autoplay}
                    value={slider.interval}
                    onChange={(event) => set('interval', Number(event.target.value))}
                    className="w-full accent-brand-600 disabled:opacity-50"
                />
            </div>
            {toggle('showArrows', 'Show arrows')}
            {toggle('showDots', 'Show dots')}
        </div>
    );
}

function SlideCard({ slide, index, total, open, errors, onToggle, onPatch, onMove, onRemove }) {
    const path = `hero.slides[${index}]`;
    const invalid = Object.keys(errors).some((key) => key.startsWith(path));
    const heading = slide.title.split('\n')[0].trim() || slide.company || t('New slide');
    const thumb = slide.image.url || slide.logo.url;

    const setCta = (key, field, value) => onPatch({ [key]: { ...slide[key], [field]: value } });

    return (
        <div className={`card overflow-hidden ${invalid ? 'border-red-300' : ''} ${slide.isActive ? '' : 'bg-slate-50'}`}>
            <div className="flex items-center gap-3 px-4 py-3">
                <button type="button" onClick={onToggle} aria-expanded={open} className="flex items-center flex-1 min-w-0 gap-3 text-start">
                    <span className="flex items-center justify-center w-12 h-12 overflow-hidden rounded-lg shrink-0 bg-slate-100 text-slate-400">
                        {thumb ? <img src={thumb} alt="" className="object-cover w-full h-full" /> : <ImageIcon size={20} />}
                    </span>
                    <span className="min-w-0">
                        <span className={`block truncate text-sm font-semibold ${slide.isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                            {index + 1}. {heading}
                        </span>
                        <span className="block text-xs truncate text-slate-500">
                            {slide.company || t('Slide {n}', { n: index + 1 })}
                            {!slide.isActive && ` · ${t('Hidden')}`}
                        </span>
                    </span>
                </button>

                <div className="flex items-center gap-1 shrink-0">
                    <Switch checked={slide.isActive} label={t('Show this slide')} onChange={(value) => onPatch({ isActive: value })} />
                    <button type="button" className="icon-btn disabled:opacity-30" disabled={index === 0} title={t('Move up')} onClick={() => onMove(-1)}>
                        <ArrowUp size={15} />
                    </button>
                    <button
                        type="button"
                        className="icon-btn disabled:opacity-30"
                        disabled={index === total - 1}
                        title={t('Move down')}
                        onClick={() => onMove(1)}
                    >
                        <ArrowDown size={15} />
                    </button>
                    <button type="button" className="icon-btn hover:bg-red-50 hover:text-red-600" title={t('Delete')} onClick={onRemove}>
                        <Trash2 size={15} />
                    </button>
                    <button type="button" className="icon-btn" aria-label={t('Expand')} onClick={onToggle}>
                        <ChevronDown size={16} className={`transition ${open ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>

            {open && (
                <div className="p-5 space-y-5 border-t border-slate-100">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <FormInput
                            label="Company or brand name"
                            dir="auto"
                            maxLength={80}
                            hint="Shown as a small label above the title"
                            value={slide.company}
                            error={errors[`${path}.company`]}
                            onChange={(event) => onPatch({ company: event.target.value })}
                        />
                        <FormInput
                            label="Small label (above the title)"
                            dir="auto"
                            maxLength={80}
                            value={slide.eyebrow}
                            error={errors[`${path}.eyebrow`]}
                            onChange={(event) => onPatch({ eyebrow: event.target.value })}
                        />
                    </div>

                    <FormTextarea
                        label="Title"
                        dir="auto"
                        rows={2}
                        maxLength={160}
                        value={slide.title}
                        error={errors[`${path}.title`]}
                        hint={`${slide.title.length}/160 · ${t('Press Enter for a new line. The last line is highlighted.')}`}
                        onChange={(event) => onPatch({ title: event.target.value })}
                    />
                    <FormTextarea
                        label="Description"
                        dir="auto"
                        rows={3}
                        maxLength={500}
                        value={slide.description}
                        error={errors[`${path}.description`]}
                        hint={`${slide.description.length}/500`}
                        onChange={(event) => onPatch({ description: event.target.value })}
                    />

                    <div className="grid gap-5 lg:grid-cols-2">
                        <ImageUploader
                            label="Slide image"
                            folder="branding"
                            value={slide.image}
                            error={errors[`${path}.image`] || errors[`${path}.image.url`]}
                            onChange={(asset) => onPatch({ image: { url: asset.url, publicId: asset.publicId } })}
                            onRemove={() => onPatch({ image: EMPTY_IMAGE })}
                            hint="Transparent PNG or a photo, up to 5 MB. About 1400 px wide works best."
                        />
                        <ImageUploader
                            label="Company logo (optional)"
                            folder="branding"
                            value={slide.logo}
                            error={errors[`${path}.logo`] || errors[`${path}.logo.url`]}
                            onChange={(asset) => onPatch({ logo: { url: asset.url, publicId: asset.publicId } })}
                            onRemove={() => onPatch({ logo: EMPTY_IMAGE })}
                            hint="Small logo shown next to the company name."
                        />
                    </div>

                    <div className="grid gap-5 lg:grid-cols-2">
                        {CTAS.map(({ key, title }) => (
                            <div key={key} className="p-4 space-y-4 border rounded-xl border-slate-200">
                                <p className="text-sm font-semibold text-slate-800">{t(title)}</p>
                                <FormInput
                                    label="Label"
                                    dir="auto"
                                    maxLength={40}
                                    value={slide[key].label}
                                    error={errors[`${path}.${key}.label`]}
                                    onChange={(event) => setCta(key, 'label', event.target.value)}
                                />
                                <FormInput
                                    label="Link"
                                    dir="ltr"
                                    maxLength={300}
                                    placeholder="/products"
                                    value={slide[key].href}
                                    error={errors[`${path}.${key}.href`]}
                                    onChange={(event) => setCta(key, 'href', event.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function HeroSlidesEditor({ hero, onChange, errors }) {
    const slides = hero.slides;
    const [open, setOpen] = useState(() => new Set(slides.length <= 2 ? slides.map((slide) => slide._uid) : []));
    const active = slides.filter((slide) => slide.isActive).length;

    const setSlides = (next) => onChange({ ...hero, slides: next });

    const toggle = (id) =>
        setOpen((current) => {
            const next = new Set(current);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });

    const patch = (id, change) => setSlides(slides.map((slide) => (slide._uid === id ? { ...slide, ...change } : slide)));

    const move = (index, delta) => {
        const target = index + delta;
        if (target < 0 || target >= slides.length) return;
        const next = [...slides];
        [next[index], next[target]] = [next[target], next[index]];
        setSlides(next);
    };

    const add = () => {
        const slide = emptySlide();
        setSlides([...slides, slide]);
        setOpen((current) => new Set(current).add(slide._uid));
    };

    return (
        <section className="p-6 space-y-5 card">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h3 className="text-base font-semibold text-slate-900">{t('Company slider')}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                        {t('Add one slide for each company in your group. Visitors see them one after another, each with its own image, title, text and buttons.')}
                    </p>
                </div>
                {slides.length > 0 && (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-600">
                        {t('{n} active of {total}', { n: active, total: slides.length })}
                    </span>
                )}
            </div>

            <div className="flex gap-3 px-4 py-3 border rounded-xl border-brand-100 bg-brand-50/40">
                <Info size={18} className="mt-0.5 shrink-0 text-brand-600" />
                <p className="text-sm text-slate-600">
                    {t('Available in the Centered layout only. When at least one active slide exists, the slider replaces the hero texts and image above.')}
                </p>
            </div>

            <SliderSettings slider={hero.slider} onChange={(slider) => onChange({ ...hero, slider })} />

            {slides.length === 0 && (
                <div className="px-6 py-10 text-center border border-dashed rounded-2xl border-slate-300">
                    <p className="text-sm font-semibold text-slate-700">{t('No slides yet')}</p>
                </div>
            )}

            <div className="space-y-3">
                {slides.map((slide, index) => (
                    <SlideCard
                        key={slide._uid}
                        slide={slide}
                        index={index}
                        total={slides.length}
                        open={open.has(slide._uid)}
                        errors={errors}
                        onToggle={() => toggle(slide._uid)}
                        onPatch={(change) => patch(slide._uid, change)}
                        onMove={(delta) => move(index, delta)}
                        onRemove={() => setSlides(slides.filter((item) => item._uid !== slide._uid))}
                    />
                ))}
            </div>

            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                    {slides.length} / {MAX_SLIDES}
                </p>
                <button type="button" className="btn-secondary" disabled={slides.length >= MAX_SLIDES} onClick={add}>
                    <Plus size={16} />
                    {t('Add slide')}
                </button>
            </div>
        </section>
    );
}