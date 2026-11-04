import { SITE_URL } from '@/lib/site';
import { getSettings } from '@/lib/api/settings';
import { getCatalogSitemap } from '@/lib/api/catalog';

export const revalidate = 3600;

const PAGES = [
    { path: '', priority: 1, changeFrequency: 'weekly' },
    { path: '/products', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/learn-more', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/about', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/contact', priority: 0.7, changeFrequency: 'yearly' },
    { path: '/privacy-policy', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/terms', priority: 0.3, changeFrequency: 'yearly' }
];

export default async function sitemap() {
    const [settings, catalog] = await Promise.all([getSettings(), getCatalogSitemap()]);
    const lastModified = settings && settings.updatedAt ? new Date(settings.updatedAt) : undefined;

    const pages = PAGES.map((page) => ({
        url: `${SITE_URL}${page.path}`,
        lastModified,
        changeFrequency: page.changeFrequency,
        priority: page.priority
    }));

    const items = catalog.map((item) => ({
        url: `${SITE_URL}/${item.kind === 'category' ? 'categories' : 'products'}/${encodeURIComponent(item.slug)}`,
        lastModified: item.updatedAt ? new Date(item.updatedAt) : undefined,
        changeFrequency: 'weekly',
        priority: item.kind === 'category' ? 0.8 : 0.7
    }));

    return [...pages, ...items];
}