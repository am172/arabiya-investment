import { SITE_URL } from '@/lib/site';
import { getSettings } from '@/lib/api/settings';

export const revalidate = 3600;

const PAGES = [
    { path: '', priority: 1, changeFrequency: 'weekly' },
    { path: '/learn-more', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/about', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/teachers', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/packages', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/student-stories', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/privacy-policy', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/terms', priority: 0.3, changeFrequency: 'yearly' }
];

export default async function sitemap() {
    const settings = await getSettings();
    const lastModified = settings && settings.updatedAt ? new Date(settings.updatedAt) : undefined;

    return PAGES.map((page) => ({
        url: `${SITE_URL}${page.path}`,
        lastModified,
        changeFrequency: page.changeFrequency,
        priority: page.priority
    }));
}