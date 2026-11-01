import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ImagePlus, Loader2, ScanSearch } from 'lucide-react';
import ColorPicker from './ColorPicker';
import ThemeThumb from './ThemeThumb';
import { extractPalette } from '../../utils/logoColors';
import { generateThemes, normalizeSeed } from '../../utils/themeGenerator';
import { t } from '../../i18n';

const ROLES = [
    { id: 'primary', label: 'Main color' },
    { id: 'secondary', label: 'Secondary' },
    { id: 'accent', label: 'Accent' }
];

export default function ThemeBuilder({ logoUrl, current, onApply }) {
    const [seed, setSeed] = useState(() =>
        normalizeSeed({
            primary: current.colors.primary,
            secondary: current.colors.secondary,
            accent: current.colors.accent
        })
    );
    const [swatches, setSwatches] = useState([]);
    const [role, setRole] = useState('primary');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [image, setImage] = useState('');
    const [picked, setPicked] = useState('');
    const fileRef = useRef(null);
    const objectUrl = useRef('');

    const variants = useMemo(() => generateThemes(seed), [seed]);

    useEffect(
        () => () => {
            if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
        },
        []
    );

    const analyze = async (source, cors) => {
        setBusy(true);
        setError('');
        setPicked('');
        try {
            const list = await extractPalette(source, { cors });
            if (list.length === 0) {
                setSwatches([]);
                setError('No colors were found in this image.');
                return;
            }
            setSwatches(list);
            setSeed(
                normalizeSeed({
                    primary: list[0].hex,
                    secondary: list[1] && list[1].hex,
                    accent: list[2] && list[2].hex
                })
            );
        } catch (err) {
            setSwatches([]);
            setError('Could not read the logo. Upload the image file instead.');
        } finally {
            setBusy(false);
        }
    };

    const useSiteLogo = () => {
        setImage(logoUrl);
        analyze(logoUrl, true);
    };

    const handleFile = (event) => {
        const file = event.target.files && event.target.files[0];
        event.target.value = '';
        if (!file) return;
        if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
        objectUrl.current = URL.createObjectURL(file);
        setImage(objectUrl.current);
        analyze(objectUrl.current, false);
    };

    const setColor = (key, value) => {
        setSeed((previous) => ({ ...previous, [key]: value }));
        setPicked('');
    };

    const apply = (variant) => {
        setPicked(variant.id);
        onApply({
            colors: variant.colors,
            darkColors: variant.darkColors,
            mode: variant.mode,
            borderRadius: variant.borderRadius
        });
    };

    return (
        <div className="space-y-6">
            <p className="text-sm text-slate-500">
                {t('Start from your logo, or choose your own colors. We generate complete light and dark themes you can preview and tweak.')}
            </p>

            <div className="flex flex-wrap items-center gap-3">
                {logoUrl && (
                    <button type="button" className="btn-secondary" disabled={busy} onClick={useSiteLogo}>
                        <ScanSearch size={16} />
                        {t('Use the website logo')}
                    </button>
                )}
                <button type="button" className="btn-secondary" disabled={busy} onClick={() => fileRef.current.click()}>
                    <ImagePlus size={16} />
                    {t('Upload an image')}
                </button>
                <input
                    ref={fileRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="hidden"
                    onChange={handleFile}
                />
                {busy && (
                    <span className="inline-flex items-center gap-2 text-sm text-slate-500">
                        <Loader2 size={16} className="animate-spin" />
                        {t('Reading colors...')}
                    </span>
                )}
            </div>

            {error && <p className="error-text">{t(error)}</p>}

            <div className="grid gap-6 lg:grid-cols-[14rem_1fr]">
                {image && (
                    <div className="flex items-center justify-center h-40 p-4 border rounded-xl border-slate-200 bg-slate-100 lg:h-auto">
                        <img src={image} alt="" className="object-contain max-w-full max-h-32" />
                    </div>
                )}

                <div className={image ? '' : 'lg:col-span-2'}>
                    {swatches.length > 0 && (
                        <div className="mb-5">
                            <p className="label">{t('Colors found in the image')}</p>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {ROLES.map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        aria-pressed={role === item.id}
                                        onClick={() => setRole(item.id)}
                                        className={`rounded-full px-3 py-1 text-xs font-semibold transition ${role === item.id
                                                ? 'bg-brand-600 text-white'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                    >
                                        {t(item.label)}
                                    </button>
                                ))}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {swatches.map((swatch) => (
                                    <button
                                        key={swatch.hex}
                                        type="button"
                                        title={swatch.hex}
                                        onClick={() => setColor(role, swatch.hex)}
                                        className="w-10 h-10 transition border-2 border-white shadow rounded-xl ring-1 ring-slate-200 hover:scale-110"
                                        style={{ background: swatch.hex }}
                                    />
                                ))}
                            </div>
                            <p className="hint">{t('Pick a role, then click a color to assign it')}</p>
                        </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-3">
                        {ROLES.map((item) => (
                            <ColorPicker
                                key={item.id}
                                label={item.label}
                                value={seed[item.id]}
                                onChange={(value) => setColor(item.id, value)}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div>
                <h4 className="text-sm font-semibold text-slate-900">{t('Generated themes')}</h4>
                <p className="mt-1 mb-4 text-sm text-slate-500">
                    {t('Each theme includes a light and a dark version. Click one to apply it, then fine-tune below.')}
                </p>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {variants.map((variant) => (
                        <button
                            key={variant.id}
                            type="button"
                            onClick={() => apply(variant)}
                            className={`relative overflow-hidden rounded-2xl border bg-card text-start transition hover:-translate-y-0.5 hover:shadow-md ${picked === variant.id ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-slate-200'
                                }`}
                        >
                            <ThemeThumb colors={variant.colors} darkColors={variant.darkColors} />
                            <div className="px-4 py-3">
                                <p className="text-sm font-semibold text-slate-900">{t(variant.label)}</p>
                                <p className="text-xs text-slate-500">{t(variant.text)}</p>
                            </div>
                            {picked === variant.id && (
                                <span className="absolute flex items-center justify-center w-6 h-6 text-white rounded-full shadow end-3 top-3 bg-brand-600">
                                    <Check size={14} strokeWidth={3} />
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}