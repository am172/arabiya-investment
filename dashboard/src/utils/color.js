const FALLBACK = '#4f46e5';

export const normalizeHex = (value, fallback = FALLBACK) => {
    const text = String(value || '').trim();
    if (/^#[0-9a-f]{6}$/i.test(text)) return text.toLowerCase();
    if (/^#[0-9a-f]{3}$/i.test(text)) {
        return `#${text
            .slice(1)
            .split('')
            .map((char) => char + char)
            .join('')}`.toLowerCase();
    }
    if (/^#[0-9a-f]{8}$/i.test(text)) return text.slice(0, 7).toLowerCase();
    return fallback;
};

const toRgb = (hex) => {
    const number = parseInt(normalizeHex(hex).slice(1), 16);
    return [(number >> 16) & 255, (number >> 8) & 255, number & 255];
};

const toHex = (rgb) =>
    `#${rgb
        .map((channel) => Math.round(Math.max(0, Math.min(255, channel))).toString(16).padStart(2, '0'))
        .join('')}`;

export const mix = (from, to, amount) => {
    const a = toRgb(from);
    const b = toRgb(to);
    return toHex(a.map((channel, index) => channel + (b[index] - channel) * amount));
};

export const luminance = (hex) => {
    const [r, g, b] = toRgb(hex).map((channel) => {
        const value = channel / 255;
        return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const readableOn = (hex) => (luminance(hex) > 0.5 ? '#0f172a' : '#ffffff');

export const buildPalette = (primary, secondary) => {
    const main = normalizeHex(primary);
    const accent = normalizeHex(secondary, '#f59e0b');
    const strong = luminance(main) > 0.55 ? mix(main, '#000000', 0.5) : main;

    return {
        strong,
        dark: mix(strong, '#000000', 0.4),
        onStrong: readableOn(strong),
        secondary: accent,
        soft: mix(main, '#ffffff', 0.92),
        tint: mix(main, '#ffffff', 0.78),
        paper: mix(accent, '#ffffff', 0.93),
        ink: '#0f172a',
        muted: '#64748b'
    };
};