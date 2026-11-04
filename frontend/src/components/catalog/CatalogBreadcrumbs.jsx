import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { SITE_URL } from '@/lib/site';

export default function CatalogBreadcrumbs({ items, label, className = '' }) {
    if (!items || items.length === 0) return null;

    const data = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: `${SITE_URL}${item.href}`
        }))
    };

    return (
        <>
            <nav aria-label={label} className={className}>
                <ol className="flex flex-wrap items-center text-sm gap-x-2 gap-y-1 text-muted">
                    {items.map((item, index) => {
                        const last = index === items.length - 1;
                        return (
                            <li key={`${item.href}-${index}`} className="flex items-center gap-2">
                                {last ? (
                                    <span aria-current="page" className="font-semibold text-foreground">
                                        {item.name}
                                    </span>
                                ) : (
                                    <Link href={item.href} className="transition hover:text-primary">
                                        {item.name}
                                    </Link>
                                )}
                                {!last && <ChevronRight size={14} aria-hidden="true" className="shrink-0 rtl:-scale-x-100" />}
                            </li>
                        );
                    })}
                </ol>
            </nav>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
            />
        </>
    );
}