// خط الموقع الأساسي في تصميم الفيجما: Cairo — Medium (500)
export const BRAND_FONT = 'Cairo';
export const BRAND_FONT_WEIGHT = 500;

export const FONT_CATEGORIES = [
    {
        id: 'arabic',
        label: 'Arabic (Corporate)',
        fonts: [
            'Cairo',
            'Tajawal',
            'Almarai',
            'IBM Plex Sans Arabic',
            'Noto Sans Arabic',
            'Noto Kufi Arabic',
            'Readex Pro',
            'Alexandria',
            'Vazirmatn',
            'Mada',
            'Zain',
            'Rubik',
            'Changa'
        ]
    },
    {
        id: 'arabic-display',
        label: 'Arabic (Heritage & Display)',
        fonts: [
            'El Messiri',
            'Reem Kufi',
            'Markazi Text',
            'Noto Naskh Arabic',
            'Amiri'
        ]
    },
    {
        id: 'sans',
        label: 'Sans-serif',
        fonts: [
            'Inter',
            'IBM Plex Sans',
            'Roboto',
            'Open Sans',
            'Lato',
            'Montserrat',
            'Poppins',
            'Manrope',
            'Plus Jakarta Sans',
            'DM Sans',
            'Work Sans',
            'Source Sans 3',
            'Public Sans',
            'Nunito Sans',
            'Figtree',
            'Outfit'
        ]
    },
    {
        id: 'serif',
        label: 'Serif',
        fonts: [
            'Playfair Display',
            'Merriweather',
            'Lora',
            'Source Serif 4',
            'Libre Baskerville',
            'Cormorant Garamond',
            'EB Garamond',
            'Crimson Pro'
        ]
    },
    {
        id: 'display',
        label: 'Industrial & modern display',
        fonts: [
            'Space Grotesk',
            'Archivo',
            'Sora',
            'Urbanist',
            'Barlow',
            'Barlow Condensed',
            'Oswald'
        ]
    }
];

export const ALL_FONTS = FONT_CATEGORIES.flatMap((group) => group.fonts);

export const findFontCategory = (name) =>
    FONT_CATEGORIES.find((group) =>
        group.fonts.some((font) => font.toLowerCase() === String(name || '').toLowerCase())
    );