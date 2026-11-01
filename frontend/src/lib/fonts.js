import { Cairo, Playpen_Sans_Arabic } from 'next/font/google';

export const arabic = Cairo({
    subsets: ['arabic', 'latin'],
    weight: ['400', '500', '600', '700', '800'],
    display: 'swap',
    variable: '--font-arabic'
});

export const handwriting = Playpen_Sans_Arabic({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-hand',
    display: 'swap',
    adjustFontFallback: false,
});