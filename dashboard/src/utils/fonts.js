const NAME = /^[A-Za-z0-9][A-Za-z0-9 -]{0,59}$/;
const loaded = new Set();

const familyParam = (name) => name.trim().replace(/\s+/g, '+');

export const isValidFontName = (name) => NAME.test(String(name || '').trim());

export const previewFonts = (names) => {
    const fresh = [...new Set(names.filter((name) => isValidFontName(name)))].filter(
        (name) => !loaded.has(name)
    );
    if (fresh.length === 0) return;

    fresh.forEach((name) => loaded.add(name));
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?${fresh
        .map((name) => `family=${familyParam(name)}:wght@400;700`)
        .join('&')}&display=swap`;
    document.head.appendChild(link);
};

export const verifyFont = async (name) => {
    const url = `https://fonts.googleapis.com/css2?family=${familyParam(
        name
    )}:wght@400;500;600;700&display=swap`;
    try {
        const response = await fetch(url);
        return response.ok ? 'ok' : 'invalid';
    } catch (error) {
        return 'error';
    }
};