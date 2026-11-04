import { notFound } from 'next/navigation';
import CatalogBreadcrumbs from '@/components/catalog/CatalogBreadcrumbs';
import CategoryCard from '@/components/catalog/CategoryCard';
import ProductCard, { Badges } from '@/components/catalog/ProductCard';
import ProductGallery from '@/components/catalog/ProductGallery';
import RequestButton from '@/components/catalog/RequestButton';
import SpecsTable, { DocumentsList, FeatureGrid, RichText } from '@/components/catalog/SpecsTable';
import Reveal from '@/components/ui/Reveal';
import { getProduct } from '@/lib/api/catalog';
import { getSettings } from '@/lib/api/settings';
import { getT } from '@/lib/serverTexts';
import { SITE_URL } from '@/lib/site';

export const revalidate = 60;

const hrefOf = (item) => `${item.kind === 'category' ? '/categories' : '/products'}/${encodeURIComponent(item.slug)}`;

const excerpt = (text, max = 160) => {
    const clean = String(text || '').replace(/\s+/g, ' ').trim();
    return clean.length > max ? `${clean.slice(0, max - 1).trim()}…` : clean;
};

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const [product, settings, t] = await Promise.all([getProduct(slug), getSettings(), getT()]);

    if (!product) return { title: t('catalog_metaTitle'), robots: { index: false, follow: false } };

    const seo = product.seo || {};
    const image = (product.cover && product.cover.url) || '';
    const title = seo.title || product.name;
    const description = seo.description || product.summary || excerpt(product.description);
    const path = `/products/${encodeURIComponent(product.slug)}`;

    return {
        title,
        description: description || undefined,
        keywords: seo.keywords && seo.keywords.length ? seo.keywords : undefined,
        alternates: { canonical: path },
        openGraph: {
            title,
            description: description || undefined,
            url: path,
            type: 'website',
            siteName: (settings && settings.siteName) || undefined,
            images: image ? [{ url: image }] : undefined
        }
    };
}

function Heading({ id, children }) {
    return (
        <h2 id={id} className="mb-6 text-2xl font-extrabold sm:text-3xl">
            {children}
        </h2>
    );
}

export default async function ProductPage({ params }) {
    const { slug } = await params;
    const [product, settings, t] = await Promise.all([getProduct(slug), getSettings(), getT()]);
    if (!product) notFound();

    const path = `/products/${encodeURIComponent(product.slug)}`;
    const images = product.gallery || [];
    const productLabels = { view: t('catalog_viewProduct'), featured: t('catalog_featured') };
    const categoryLabels = { view: t('catalog_viewCategory') };
    const hasFeatures = product.features && product.features.length > 0;
    const hasSpecs = product.specs && product.specs.length > 0;
    const hasDocuments = product.documents && product.documents.length > 0;

    const crumbs = [
        { name: t('catalog_home'), href: '/' },
        { name: t('catalog_metaTitle'), href: '/products' },
        ...product.breadcrumbs.map((item) => ({ name: item.name, href: hrefOf(item) })),
        { name: product.name, href: path }
    ];

    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.summary || excerpt(product.description) || undefined,
        image: images.length > 0 ? images.map((item) => item.url) : undefined,
        sku: product.sku || undefined,
        url: `${SITE_URL}${path}`,
        brand: settings && settings.siteName ? { '@type': 'Brand', name: settings.siteName } : undefined
    };

    return (
        <main dir="rtl" lang="ar" className="min-h-[80svh] bg-background pb-24 pt-32 sm:pt-40">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }}
            />

            <div className="px-5 mx-auto max-w-7xl sm:px-8">
                <CatalogBreadcrumbs items={crumbs} label={t('catalog_breadcrumbs')} />

                <div className="grid gap-10 mt-8 lg:grid-cols-2 lg:gap-14">
                    <ProductGallery
                        images={images}
                        name={product.name}
                        labels={{
                            gallery: t('catalog_gallery', { name: product.name }),
                            open: t('catalog_openImage', { n: 1 }),
                            prev: t('carousel_prev'),
                            next: t('carousel_next'),
                            close: t('request_close')
                        }}
                    />

                    <div className="flex flex-col gap-5">
                        <Badges items={product.badges} limit={6} />
                        <h1 className="text-3xl font-extrabold leading-[1.4] sm:text-4xl">{product.name}</h1>
                        {product.sku && (
                            <p dir="ltr" className="text-sm font-medium text-start text-muted">
                                {t('catalog_sku', { sku: product.sku })}
                            </p>
                        )}
                        {product.summary && <p className="text-lg leading-9 text-muted">{product.summary}</p>}

                        <div className="flex flex-wrap items-center gap-3 mt-2">
                            {product.allowOrderRequest ? (
                                <RequestButton
                                    product={{
                                        _id: product._id,
                                        slug: product.slug,
                                        name: product.name,
                                        ctaLabel: product.ctaLabel,
                                        options: product.options,
                                        allowOrderRequest: product.allowOrderRequest
                                    }}
                                />
                            ) : (
                                <p className="px-4 py-3 text-sm font-medium rounded-xl bg-foreground/10 text-muted">
                                    {t('catalog_unavailable')}
                                </p>
                            )}
                        </div>

                        {product.tags && product.tags.length > 0 && (
                            <ul className="flex flex-wrap gap-2 mt-2">
                                {product.tags.slice(0, 8).map((tag) => (
                                    <li key={tag} className="px-3 py-1 text-xs border rounded-full border-border text-muted">
                                        {tag}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {product.description && (
                    <section aria-labelledby="product-overview" className="mt-16">
                        <Heading id="product-overview">{t('catalog_overview')}</Heading>
                        <RichText text={product.description} className="max-w-4xl" />
                    </section>
                )}

                {hasFeatures && (
                    <section aria-labelledby="product-features" className="mt-16">
                        <Heading id="product-features">{t('catalog_features')}</Heading>
                        <FeatureGrid features={product.features} />
                    </section>
                )}

                {hasSpecs && (
                    <section aria-labelledby="product-specs" className="mt-16">
                        <Heading id="product-specs">{t('catalog_specs')}</Heading>
                        <SpecsTable specs={product.specs} caption={t('catalog_specs')} />
                    </section>
                )}

                {hasDocuments && (
                    <section aria-labelledby="product-documents" className="mt-16">
                        <Heading id="product-documents">{t('catalog_documents')}</Heading>
                        <DocumentsList documents={product.documents} label={t('catalog_download')} />
                    </section>
                )}

                {product.children.length > 0 && (
                    <section aria-labelledby="product-variants" className="mt-16">
                        <Heading id="product-variants">{t('catalog_variants')}</Heading>
                        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {product.children.map((child, index) => (
                                <Reveal key={child._id} as="li" delay={(index % 4) * 0.07} className="h-full">
                                    {child.kind === 'category' ? (
                                        <CategoryCard
                                            category={child}
                                            labels={categoryLabels}
                                            meta={child.childrenCount > 0 ? t('catalog_itemsCount', { n: child.childrenCount }) : ''}
                                            className="h-full"
                                        />
                                    ) : (
                                        <ProductCard product={child} labels={productLabels} />
                                    )}
                                </Reveal>
                            ))}
                        </ul>
                    </section>
                )}

                {product.related.length > 0 && (
                    <section aria-labelledby="product-related" className="mt-16">
                        <Heading id="product-related">{t('catalog_related')}</Heading>
                        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {product.related.map((item, index) => (
                                <Reveal key={item._id} as="li" delay={(index % 4) * 0.07} className="h-full">
                                    <ProductCard product={item} labels={productLabels} />
                                </Reveal>
                            ))}
                        </ul>
                    </section>
                )}
            </div>
        </main>
    );
}