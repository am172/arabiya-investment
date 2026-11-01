import { SITE_URL } from '@/lib/site';

const clean = (object) =>
    Object.fromEntries(
        Object.entries(object).filter(
            ([, value]) =>
                value !== undefined && value !== null && value !== '' && !(Array.isArray(value) && value.length === 0)
        )
    );

export default function JsonLd({ settings }) {
    if (!settings) return null;

    const contact = settings.contact || {};
    const seo = settings.seo || {};
    const data = clean({
        '@context': 'https://schema.org',
        '@type': 'EducationalOrganization',
        name: settings.siteName,
        url: SITE_URL,
        logo: settings.logo && settings.logo.url,
        description: seo.description || settings.tagline,
        email: contact.email,
        telephone: contact.phone,
        address: contact.address ? { '@type': 'PostalAddress', streetAddress: contact.address } : undefined,
        sameAs: Object.values(settings.socialLinks || {}).filter(Boolean)
    });

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
        />
    );
}