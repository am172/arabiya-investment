export const FONT_CATEGORIES = [
    {
        id: 'arabic',
        label: 'Arabic',
        fonts: [
            'Cairo',
            'IBM Plex Sans Arabic',
            'Noto Sans Arabic',
            'Noto Kufi Arabic',
            'Readex Pro',
            'El Messiri',
            'Reem Kufi',
            'Baloo Bhaijaan 2',
            'Changa',
            'Markazi Text',
            'Noto Naskh Arabic'
        ]
    },
    {
        id: 'sans',
        label: 'Sans-serif',
        fonts: [
            'Inter',
            'Poppins',
            'DM Sans',
            'Manrope',
            'Plus Jakarta Sans',
            'Outfit',
            'Sora',
            'Montserrat',
            'Open Sans',
            'Work Sans',
            'Figtree',
            'Rubik',
            'Lexend',
            'Raleway',
            'Public Sans',
            'Albert Sans',
            'Source Sans 3'
        ]
    },
    {
        id: 'serif',
        label: 'Serif',
        fonts: [
            'Playfair Display',
            'Fraunces',
            'Lora',
            'Cormorant Garamond',
            'EB Garamond',
            'Source Serif 4',
            'Crimson Pro'
        ]
    },
    {
        id: 'rounded',
        label: 'Rounded & friendly',
        fonts: ['Nunito', 'Baloo 2', 'Quicksand', 'Fredoka', 'Comfortaa']
    },
    {
        id: 'display',
        label: 'Modern display',
        fonts: [
            'Space Grotesk',
            'Syne',
            'Bricolage Grotesque',
            'Unbounded',
            'Urbanist',
            'Epilogue',
            'Archivo'
        ]
    },

];

export const ALL_FONTS = FONT_CATEGORIES.flatMap((group) => group.fonts);

export const findFontCategory = (name) =>
    FONT_CATEGORIES.find((group) =>
        group.fonts.some((font) => font.toLowerCase() === String(name || '').toLowerCase())
    );