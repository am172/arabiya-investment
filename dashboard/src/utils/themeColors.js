const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export const hexToRgb = (hex) => {
    let value = String(hex || '').replace('#', '');
    if (value.length === 3) value = value.split('').map((char) => char + char).join('');
    const number = parseInt(value.slice(0, 6), 16);
    if (Number.isNaN(number)) return [0, 0, 0];
    return [(number >> 16) & 255, (number >> 8) & 255, number & 255];
};

export const rgbToHex = (rgb) =>
    `#${rgb
        .map((channel) => Math.round(clamp(channel, 0, 255)).toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase()}`;

export const rgbToHsl = ([red, green, blue]) => {
    const r = red / 255;
    const g = green / 255;
    const b = blue / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    const d = max - min;
    let h = 0;
    let s = 0;

    if (d) {
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
        else if (max === g) h = (b - r) / d + 2;
        else h = (r - g) / d + 4;
        h *= 60;
    }
    return [h, s, l];
};

export const hslToRgb = ([hue, s, l]) => {
    const h = ((hue % 360) + 360) % 360;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r = 0;
    let g = 0;
    let b = 0;

    if (h < 60) {
        r = c;
        g = x;
    } else if (h < 120) {
        r = x;
        g = c;
    } else if (h < 180) {
        g = c;
        b = x;
    } else if (h < 240) {
        g = x;
        b = c;
    } else if (h < 300) {
        r = x;
        b = c;
    } else {
        r = c;
        b = x;
    }
    return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
};

export const hslToHex = (h, s, l) => rgbToHex(hslToRgb([h, clamp(s), clamp(l)]));

export const toHsl = (hex) => rgbToHsl(hexToRgb(hex));

const channel = (value) => {
    const v = value / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};

export const luminance = (hex) => {
    const [r, g, b] = hexToRgb(hex).map(channel);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const contrast = (a, b) => {
    const la = luminance(a);
    const lb = luminance(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};

export const onColor = (hex) =>
    contrast(hex, '#FFFFFF') >= contrast(hex, '#0F172A') ? '#FFFFFF' : '#0F172A';

export const ensureContrast = (hex, background, minimum, direction) => {
    const [h, s, l0] = toHsl(hex);
    let l = l0;
    let out = hex;
    for (let step = 0; step < 50 && contrast(out, background) < minimum; step += 1) {
        l = clamp(l + (direction === 'lighten' ? 0.02 : -0.02));
        out = hslToHex(h, s, l);
    }
    return out.toUpperCase();
};