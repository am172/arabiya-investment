import { useEffect } from 'react';
import { t } from '../../i18n';

const RADIUS = { none: '0px', sm: '4px', md: '8px', lg: '12px', xl: '16px', full: '24px' };

const loadFont = (name) => {
  if (!name) return;
  const id = `preview-font-${name.replace(/\s+/g, '-')}`;
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(name).replace(
    /%20/g,
    '+'
  )}:wght@400;600;700&display=swap`;
  document.head.appendChild(link);
};

export default function PalettePreview({ theme, dark = false }) {
  const { fonts, borderRadius } = theme;
  const colors = dark ? { ...theme.colors, ...theme.darkColors } : theme.colors;
  const radius = RADIUS[borderRadius] || RADIUS.lg;
  const buttonRadius = borderRadius === 'full' ? '9999px' : radius;

  useEffect(() => {
    loadFont(fonts.heading);
    loadFont(fonts.body);
  }, [fonts.heading, fonts.body]);

  return (
    <div
      dir="rtl"
      className="overflow-hidden border"
      style={{
        background: colors.background,
        color: colors.text,
        borderColor: colors.border,
        borderRadius: radius,
        fontFamily: `'${fonts.body}', sans-serif`
      }}
    >
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ background: colors.primary, color: colors.primaryForeground }}
      >
        <span className="font-bold" style={{ fontFamily: `'${fonts.heading}', sans-serif` }}>
          {t('Sample heading')}
        </span>
        <span className="text-xs opacity-90">
          {t('Home')} · {t('Teachers')} · {t('Packages')}
        </span>
      </div>

      <div className="p-5 space-y-4">
        <h4 className="text-xl font-bold" style={{ fontFamily: `'${fonts.heading}', sans-serif` }}>
          {t('Learning that people love')}
        </h4>
        <p className="text-sm" style={{ color: colors.textMuted }}>
          {t('Live online classes with caring, expert teachers.')}
        </p>
        <div className="flex flex-wrap gap-2">
          <span
            className="px-4 py-2 text-sm font-semibold"
            style={{ background: colors.primary, color: colors.primaryForeground, borderRadius: buttonRadius }}
          >
            {t('Get started')}
          </span>
          <span
            className="px-4 py-2 text-sm font-semibold"
            style={{ background: colors.secondary, color: colors.secondaryForeground, borderRadius: buttonRadius }}
          >
            {t('Learn more')}
          </span>
        </div>

        <div
          className="p-4 space-y-2 border"
          style={{ background: colors.surface, borderColor: colors.border, borderRadius: radius }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">{t('Standard package')}</span>
            <span
              className="px-2 py-0.5 text-xs font-semibold"
              style={{ background: colors.accent, color: '#ffffff', borderRadius: buttonRadius }}
            >
              {t('Popular')}
            </span>
          </div>
          <p className="text-xs" style={{ color: colors.textMuted }}>
            {t('8 live sessions per month')}
          </p>
        </div>

        <div className="flex gap-2 text-xs font-semibold text-white">
          <span className="px-2 py-1" style={{ background: colors.success, borderRadius: buttonRadius }}>
            {t('Success')}
          </span>
          <span className="px-2 py-1" style={{ background: colors.warning, borderRadius: buttonRadius }}>
            {t('Warning')}
          </span>
          <span className="px-2 py-1" style={{ background: colors.error, borderRadius: buttonRadius }}>
            {t('Error')}
          </span>
        </div>
      </div>
    </div>
  );
}