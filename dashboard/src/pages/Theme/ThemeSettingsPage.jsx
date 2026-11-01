import { useEffect, useState } from 'react';
import { Loader2, RotateCcw } from 'lucide-react';
import settingsService from '../../services/settings.service';
import themeService from '../../services/theme.service';
import useFetch from '../../hooks/useFetch';
import useConfirm from '../../hooks/useConfirm';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ColorPicker from '../../components/theme/ColorPicker';
import FontPicker from '../../components/theme/FontPicker';
import PalettePreview from '../../components/theme/PalettePreview';
import PresetThemes from '../../components/theme/PresetThemes';
import ThemeBuilder from '../../components/theme/ThemeBuilder';
import FormSelect from '../../components/forms/FormSelect';
import { DEFAULT_THEME, THEME_COLOR_FIELDS } from '../../constants/config';
import { t } from '../../i18n';

const RADIUS_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
  { value: 'xl', label: 'Extra large' },
  { value: 'full', label: 'Full' }
];

const MODE_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' }
];

const SOURCES = [
  { id: 'presets', label: 'Ready-made themes' },
  { id: 'generate', label: 'Generate from logo or colors' }
];

const DARK_NEUTRALS = {
  background: '#070814',
  surface: '#0F1122',
  text: '#F1F5F9',
  textMuted: '#94A3B8',
  border: '#272B46'
};

const withDark = (colors, stored = {}) => {
  const base = {};
  THEME_COLOR_FIELDS.forEach(({ key }) => {
    base[key] = DARK_NEUTRALS[key] || colors[key];
  });
  return { ...base, ...stored };
};

const normalize = (theme = {}) => {
  const colors = { ...DEFAULT_THEME.colors, ...(theme.colors || {}) };
  return {
    colors,
    darkColors: withDark(colors, theme.darkColors || {}),
    fonts: {
      heading: (theme.fonts && theme.fonts.heading) || DEFAULT_THEME.fonts.heading,
      body: (theme.fonts && theme.fonts.body) || DEFAULT_THEME.fonts.body
    },
    borderRadius: theme.borderRadius || DEFAULT_THEME.borderRadius,
    mode: theme.mode || DEFAULT_THEME.mode
  };
};

export default function ThemeSettingsPage() {
  const toast = useToast();
  const { confirm, confirmProps } = useConfirm();
  const { data, loading, error } = useFetch(() => settingsService.get(), []);
  const [theme, setTheme] = useState(null);
  const [saving, setSaving] = useState(false);
  const [source, setSource] = useState('presets');
  const [side, setSide] = useState('light');

  useEffect(() => {
    if (data) {
      const next = normalize(data.theme);
      setTheme(next);
      setSide(next.mode === 'dark' ? 'dark' : 'light');
    }
  }, [data]);

  const colorKey = side === 'dark' ? 'darkColors' : 'colors';

  const setColor = (key, value) =>
    setTheme((current) => ({ ...current, [colorKey]: { ...current[colorKey], [key]: value } }));

  const setFont = (key, value) =>
    setTheme((current) => ({ ...current, fonts: { ...current.fonts, [key]: value } }));

  const applyPatch = (patch) => {
    setTheme((previous) => {
      const colors = { ...previous.colors, ...patch.colors };
      return {
        ...previous,
        ...patch,
        colors,
        darkColors: withDark(colors, patch.darkColors || {})
      };
    });
    if (patch.mode) setSide(patch.mode);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await themeService.update(theme);
      setTheme(normalize(res.data));
      toast.success('Theme saved. The website will update shortly.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    const ok = await confirm({
      title: 'Reset theme',
      message: 'All colors, fonts and shapes return to the default theme.',
      confirmLabel: 'Reset'
    });
    if (!ok) return;
    try {
      const res = await themeService.reset();
      setTheme(normalize(res.data));
      setSide('light');
      toast.success('Theme reset to default');
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading && !theme) return <Loader />;
  if (error || !theme) return <EmptyState title="Could not load theme" description={error} />;

  const logoUrl = data && data.logo && data.logo.url;
  return (
    <div className="min-w-0">
      <PageHeader
        title="Theme"
        description="Control the color palette and style of the public website."
        action={
          <div className="flex flex-wrap items-center w-full gap-2 sm:w-auto sm:gap-3">
            <button
              type="button"
              className="justify-center flex-1 btn-secondary sm:flex-initial"
              onClick={handleReset}
            >
              <RotateCcw size={16} />
              {t('Reset')}
            </button>
            <button
              type="button"
              className="justify-center flex-1 btn-primary sm:flex-initial"
              disabled={saving}
              onClick={handleSave}
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              {t('Save theme')}
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-5">
        <div className="min-w-0 space-y-4 sm:space-y-6 xl:col-span-3">
          <section className="p-4 overflow-hidden sm:p-6 card">
            <div role="tablist" aria-label={t('Theme source')} className="flex flex-wrap gap-2 mb-5">
              {SOURCES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={source === item.id}
                  onClick={() => setSource(item.id)}
                  className={`flex-1 sm:flex-initial text-center rounded-full px-4 py-2 text-sm font-medium transition ${source === item.id
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  {t(item.label)}
                </button>
              ))}
            </div>

            {source === 'presets' ? (
              <PresetThemes current={theme} onSelect={applyPatch} />
            ) : (
              <ThemeBuilder logoUrl={logoUrl} current={theme} onApply={applyPatch} />
            )}
          </section>

          <section className="p-4 overflow-hidden sm:p-6 card">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <h3 className="text-base font-semibold text-slate-900">{t('Colors')}</h3>
              <div role="group" className="inline-flex w-full p-1 rounded-xl bg-slate-100 sm:w-auto">
                {['light', 'dark'].map((item) => (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={side === item}
                    onClick={() => setSide(item)}
                    className={`flex-1 sm:flex-initial rounded-lg px-4 py-1.5 text-xs font-semibold transition ${side === item ? 'bg-card text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                      }`}
                  >
                    {t(item === 'light' ? 'Light colors' : 'Dark colors')}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2">
              {THEME_COLOR_FIELDS.map(({ key, label }) => (
                <ColorPicker
                  key={`${side}-${key}`}
                  label={label}
                  value={theme[colorKey][key]}
                  onChange={(value) => setColor(key, value)}
                />
              ))}
            </div>
          </section>

          <section className="p-4 overflow-hidden sm:p-6 card">
            <div className="mb-5">
              <h3 className="text-base font-semibold text-slate-900">{t('Typography')}</h3>
              <p className="mt-1 text-sm text-slate-500">
                {t('Choose the heading and body fonts separately.')}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2">
              <FontPicker
                label="Heading font"
                value={theme.fonts.heading}
                weight={700}
                sample="Learning that people love"
                onChange={(font) => setFont('heading', font)}
              />
              <FontPicker
                label="Body font"
                value={theme.fonts.body}
                sample="Clear, readable paragraph text for your visitors."
                onChange={(font) => setFont('body', font)}
              />
            </div>
          </section>

          <section className="p-4 overflow-hidden sm:p-6 card">
            <h3 className="mb-5 text-base font-semibold text-slate-900">{t('Shape and mode')}</h3>
            <div className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2">
              <FormSelect
                label="Corner radius"
                options={RADIUS_OPTIONS}
                value={theme.borderRadius}
                onChange={(event) => setTheme({ ...theme, borderRadius: event.target.value })}
              />
              <FormSelect
                label="Default mode"
                hint="Visitors can switch with the toggle. Their choice is remembered."
                options={MODE_OPTIONS}
                value={theme.mode}
                onChange={(event) => setTheme({ ...theme, mode: event.target.value })}
              />
            </div>
          </section>
        </div>

        <div className="min-w-0 xl:col-span-2">
          <div className="xl:sticky xl:top-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-slate-900">{t('Live preview')}</h3>
              <span className="text-xs text-slate-500">
                {t(side === 'dark' ? 'Dark colors' : 'Light colors')}
              </span>
            </div>
            <PalettePreview theme={theme} dark={side === 'dark'} />
          </div>
        </div>
      </div>
      <ConfirmDialog {...confirmProps} />
    </div>
  );
}