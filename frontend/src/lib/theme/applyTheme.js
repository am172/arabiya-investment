import { defaultTheme } from './defaultTheme';

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const FONT = /^[A-Za-z0-9][A-Za-z0-9 -]{0,59}$/;

const BRAND = {
  primary: 'primary',
  primaryForeground: 'primary-foreground',
  secondary: 'secondary',
  secondaryForeground: 'secondary-foreground',
  accent: 'accent',
  success: 'success',
  warning: 'warning',
  error: 'error'
};

const NEUTRAL = {
  background: 'background',
  surface: 'surface',
  text: 'foreground',
  textMuted: 'muted',
  border: 'border'
};

const RADIUS = {
  none: '0px',
  sm: '0.5rem',
  md: '0.75rem',
  lg: '1.25rem',
  xl: '1.75rem',
  full: '2.25rem'
};

export const hexToChannels = (hex) => {
  if (typeof hex !== 'string' || !HEX.test(hex.trim())) return null;
  let value = hex.trim().slice(1);
  if (value.length === 3) {
    value = value
      .split('')
      .map((char) => char + char)
      .join('');
  }
  const number = parseInt(value.slice(0, 6), 16);
  return `${(number >> 16) & 255} ${(number >> 8) & 255} ${number & 255}`;
};

export const resolveTheme = (theme) => {
  const source = theme && typeof theme === 'object' ? theme : {};
  return {
    colors: { ...defaultTheme.colors, ...(source.colors || {}) },
    darkColors: source.darkColors && typeof source.darkColors === 'object' ? source.darkColors : {},
    fonts: { ...defaultTheme.fonts, ...(source.fonts || {}) },
    borderRadius: source.borderRadius || defaultTheme.borderRadius,
    mode: source.mode === 'dark' ? 'dark' : 'light'
  };
};

const safeFont = (name, fallback) =>
  typeof name === 'string' && FONT.test(name.trim()) ? name.trim() : fallback;

const toDeclarations = (map, colors) =>
  Object.entries(map)
    .map(([key, variable]) => {
      const channels = hexToChannels(colors[key]);
      return channels ? `--${variable}:${channels};` : '';
    })
    .join('');

export const buildThemeCss = (theme) => {
  const brand = toDeclarations(BRAND, theme.colors);
  const neutral = toDeclarations(NEUTRAL, theme.colors);
  const dark = toDeclarations({ ...BRAND, ...NEUTRAL }, theme.darkColors);
  const heading = safeFont(theme.fonts.heading, 'Poppins');
  const body = safeFont(theme.fonts.body, 'Inter');
  const radius = RADIUS[theme.borderRadius] || RADIUS.lg;

  return `html:root{${brand}--font-heading:'${heading}',system-ui,sans-serif;--font-body:'${body}',system-ui,sans-serif;--radius:${radius};}html:root:not(.dark){${neutral}}${
    dark ? `html.dark:root{${dark}}` : ''
  }`;
};

export const fontLinks = (theme) => {
  const names = [
    ...new Set([safeFont(theme.fonts.heading, 'Poppins'), safeFont(theme.fonts.body, 'Inter')])
  ];
  return names.map(
    (name) =>
      `https://fonts.googleapis.com/css2?family=${name.replace(/\s+/g, '+')}:wght@400;500;600;700&display=swap`
  );
};