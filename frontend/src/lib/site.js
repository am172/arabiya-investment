export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');

export const siteBase = () => {
    try {
        return new URL(SITE_URL);
    } catch (error) {
        return undefined;
    }
};