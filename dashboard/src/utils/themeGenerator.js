import { ensureContrast, hslToHex, onColor, toHsl } from './themeColors';

const LIGHT_STATUS = { success: '#16A34A', warning: '#D97706', error: '#DC2626' };
const DARK_STATUS = { success: '#4ADE80', warning: '#FBBF24', error: '#F87171' };

export const normalizeSeed = (seed) => {
    const [hue, saturation] = toHsl(seed.primary);
    const neutral = saturation < 0.12;
    return {
        primary: seed.primary,
        secondary: seed.secondary || (neutral ? '#F59E0B' : hslToHex(hue + 30, Math.max(saturation, 0.6), 0.5)),
        accent: seed.accent || (neutral ? '#2563EB' : hslToHex(hue + 180, Math.max(saturation, 0.55), 0.48))
    };
};

const finish = (values, status) => ({
    primary: values.primary,
    primaryForeground: onColor(values.primary),
    secondary: values.secondary,
    secondaryForeground: onColor(values.secondary),
    accent: values.accent,
    background: values.background,
    surface: values.surface,
    text: values.text,
    textMuted: values.textMuted,
    border: values.border,
    ...status
});

const buildLight = (seed, flavour) => {
    const [hue, saturation] = toHsl(seed.primary);
    const tint = (value) => (saturation < 0.12 ? 0.03 : value);
    const background = hslToHex(hue, tint(flavour.bgS), flavour.bgL);
    const surface = hslToHex(hue, tint(flavour.surfS), flavour.surfL);

    return finish(
        {
            primary: ensureContrast(seed.primary, background, 4.5, 'darken'),
            secondary: seed.secondary,
            accent: ensureContrast(seed.accent, background, 3, 'darken'),
            background,
            surface,
            text: hslToHex(hue, tint(0.4), 0.1),
            textMuted: ensureContrast(hslToHex(hue, tint(0.15), 0.45), background, 4.5, 'darken'),
            border: hslToHex(hue, tint(0.25), 0.89)
        },
        LIGHT_STATUS
    );
};

const buildDark = (seed, flavour) => {
    const [hue, saturation] = toHsl(seed.primary);
    const tint = (value) => (saturation < 0.12 ? 0.03 : value);
    const base = flavour.darkBg;
    const background = hslToHex(hue, tint(0.45), base);
    const surface = hslToHex(hue, tint(0.4), base + 0.04);

    return finish(
        {
            primary: ensureContrast(seed.primary, background, 4.5, 'lighten'),
            secondary: ensureContrast(seed.secondary, background, 3, 'lighten'),
            accent: ensureContrast(seed.accent, background, 3, 'lighten'),
            background,
            surface,
            text: hslToHex(hue, tint(0.25), 0.95),
            textMuted: ensureContrast(hslToHex(hue, tint(0.12), 0.65), background, 4.5, 'lighten'),
            border: hslToHex(hue, tint(0.3), 0.2)
        },
        DARK_STATUS
    );
};

const make = (id, label, text, seed, flavour, radius, mode = 'light') => ({
    id,
    label,
    text,
    mode,
    borderRadius: radius,
    colors: buildLight(seed, flavour),
    darkColors: buildDark(seed, flavour)
});

export const generateThemes = (rawSeed) => {
    const seed = normalizeSeed(rawSeed);
    const swapped = { primary: seed.secondary, secondary: seed.primary, accent: seed.accent };
    const clean = { bgS: 0, bgL: 1, surfS: 0.35, surfL: 0.97, darkBg: 0.06 };
    const soft = { bgS: 0.55, bgL: 0.97, surfS: 0.5, surfL: 0.93, darkBg: 0.07 };
    const night = { ...clean, darkBg: 0.045 };

    return [
        make('balanced', 'Balanced', 'White and clean with your brand colors', seed, clean, 'lg'),
        make('soft', 'Soft tint', 'A gentle tinted background', seed, soft, 'xl'),
        make('night', 'Night', 'Dark by default, light version included', seed, night, 'lg', 'dark'),
        make('alternate', 'Alternate roles', 'Swaps the main and secondary colors', swapped, clean, 'md')
    ];
};