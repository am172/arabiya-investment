import { useState } from 'react';
import {
  Briefcase,
  Check,
  Cloud,
  GraduationCap,
  Landmark,
  Moon,
  Newspaper,
  Smile,
  Sparkles,
  Square,
  Star
} from 'lucide-react';
import ThemeThumb from './ThemeThumb';
import { PRESET_CATEGORIES } from '../../constants/themePresets';
import { THEME_COLOR_FIELDS } from '../../constants/config';
import { t } from '../../i18n';

const ICONS = {
  landmark: Landmark,
  graduation: GraduationCap,
  smile: Smile,
  moon: Moon,
  newspaper: Newspaper,
  square: Square,
  sparkles: Sparkles,
  cloud: Cloud,
  briefcase: Briefcase,
  star: Star
};

const sameColors = (a, b) =>
  Boolean(a && b) &&
  THEME_COLOR_FIELDS.every(
    ({ key }) => String(a[key] || '').toLowerCase() === String(b[key] || '').toLowerCase()
  );

const findCategory = (colors) => {
  const match = PRESET_CATEGORIES.find((group) =>
    group.themes.some((item) => sameColors(item.colors, colors))
  );
  return match ? match.id : PRESET_CATEGORIES[0].id;
};

function ThemeCard({ preset, active, onSelect }) {
  const { fonts } = preset;

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={() => onSelect(preset)}
      className={`group relative overflow-hidden rounded-2xl border bg-card text-start transition hover:-translate-y-0.5 hover:shadow-md ${
        active ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <ThemeThumb colors={preset.colors} darkColors={preset.darkColors} />

      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-slate-900">
            {preset.label || preset.name}
            {preset.mode === 'dark' && <Moon size={13} className="shrink-0 text-slate-400" />}
          </p>
          <p dir="ltr" className="text-xs truncate text-start text-slate-500">
            {fonts.heading === fonts.body ? fonts.heading : `${fonts.heading} · ${fonts.body}`}
          </p>
        </div>
        <span className="flex shrink-0 -space-x-1.5 rtl:space-x-reverse">
          {['primary', 'secondary', 'accent'].map((key) => (
            <span
              key={key}
              className="w-5 h-5 border-2 border-white rounded-full"
              style={{ background: preset.colors[key] }}
            />
          ))}
        </span>
      </div>

      {active && (
        <span className="absolute flex items-center justify-center w-6 h-6 text-white rounded-full shadow end-3 top-3 bg-brand-600">
          <Check size={14} strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

export default function PresetThemes({ current, onSelect }) {
  const [activeId, setActiveId] = useState(() => findCategory(current && current.colors));
  const [includeStyle, setIncludeStyle] = useState(true);

  const group = PRESET_CATEGORIES.find((item) => item.id === activeId) || PRESET_CATEGORIES[0];

  const handleSelect = (preset) => {
    const patch = {
      colors: { ...preset.colors },
      darkColors: { ...preset.darkColors },
      mode: preset.mode
    };
    if (includeStyle) {
      patch.fonts = { ...preset.fonts };
      patch.borderRadius = preset.borderRadius;
    }
    onSelect(patch);
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label={t('Preset categories')}
        className="flex gap-2 px-1 pb-2 -mx-1 overflow-x-auto"
      >
        {PRESET_CATEGORIES.map((item) => {
          const Icon = ICONS[item.icon] || Smile;
          const selected = item.id === group.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`preset-tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`preset-panel-${item.id}`}
              onClick={() => setActiveId(item.id)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                selected
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Icon size={16} />
              {item.category}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                  selected ? 'bg-white/20 text-white' : 'bg-card text-slate-500'
                }`}
              >
                {item.themes.length}
              </span>
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`preset-panel-${group.id}`}
        aria-labelledby={`preset-tab-${group.id}`}
        className="mt-4"
      >
        <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">{group.description}</p>
          <label className="flex items-center gap-2 text-sm font-medium cursor-pointer shrink-0 text-slate-600">
            <input
              type="checkbox"
              checked={includeStyle}
              onChange={(event) => setIncludeStyle(event.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            {t('Also apply fonts and corner style')}
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {group.themes.map((preset) => (
            <ThemeCard
              key={preset.name}
              preset={preset}
              active={sameColors(preset.colors, current && current.colors)}
              onSelect={handleSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
}