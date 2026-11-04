import Image from 'next/image';
import { notFound } from 'next/navigation';
import CatalogBreadcrumbs from '@/components/catalog/CatalogBreadcrumbs';
import CategoryCard from '@/components/catalog/CategoryCard';
import CategoryProducts from '@/components/catalog/CategoryProducts';
import RequestButton from '@/components/catalog/RequestButton';
import { Badges } from '@/components/catalog/ProductCard';
import { DocumentsList, FeatureGrid, RichText } from '@/components/catalog/SpecsTable';
import Reveal from '@/components/ui/Reveal';
import { getCategory, getCategoryProducts } from '@/lib/api/catalog';
import { getSettings } from '@/lib/api/settings';
import { getT } from '@/lib/serverTexts';

export const revalidate = 60;

const hrefOf = (item) => `${item.kind === 'category' ? '/categories' : '/products'}/${encodeURIComponent(item.slug)}`;

const excerpt = (text, max = 160) => {
    const clean = String(text || '').replace(/\s+/g, ' ').trim();
    return clean.length > max ? `${clean.slice(0, max - 1).trim()}…` : clean;
};

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const [category, settings, t] = await Promise.all([getCategory(slug), getSettings(), getT()]);

    if (!category) return { title: t('catalog_metaTitle'), robots: { index: false, follow: false } };

    const seo = category.seo || {};
    const image = (category.banner && category.banner.url) || (category.cover && category.cover.url) || '';
    const title = seo.title || category.name;
    const description = seo.description || category.summary || excerpt(category.description);
    const path = `/categories/${encodeURIComponent(category.slug)}`;

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

export default async function CategoryPage({ params }) {
    const { slug } = await params;
    const [category, t] = await Promise.all([getCategory(slug), getT()]);
    if (!category) notFound();

    const initial =
        category.productCount > 0
            ? await getCategoryProducts(category.slug, { page: 1, limit: 12 })
            : { items: [], meta: null };

    const banner = category.banner && category.banner.url;
    const tone = banner ? 'text-white' : 'text-primary-foreground';
    const subcategories = category.children.filter((child) => child.kind === 'category');
    const hasContent = subcategories.length > 0 || category.productCount > 0;
    const path = `/categories/${encodeURIComponent(category.slug)}`;
    const labels = { view: t('catalog_viewCategory') };

    const metaOf = (item) => {
        if (item.childrenCount > 0) return t('catalog_itemsCount', { n: item.childrenCount });
        return '';
    };

    const crumbs = [
        { name: t('catalog_home'), href: '/' },
        { name: t('catalog_metaTitle'), href: '/products' },
        ...category.breadcrumbs.map((item) => ({ name: item.name, href: hrefOf(item) })),
        { name: category.name, href: path }
    ];

    return (
        <main dir="rtl" lang="ar" className="min-h-[80svh] bg-background pb-24 pt-32 sm:pt-40">
            <div className="px-5 mx-auto max-w-7xl sm:px-8">
                <CatalogBreadcrumbs items={crumbs} label={t('catalog_breadcrumbs')} className="mb-6" />

                <header className="relative overflow-hidden isolate rounded-theme">
                    {banner ? (
                        <>
                            <Image
                                src={banner}
                                alt=""
                                fill
                                priority
                                sizes="(min-width: 1280px) 1200px, 100vw"
                                className="object-cover -z-10"
                            />
                            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-black/75 via-black/45 to-black/20" />
                        </>
                    ) : (
                        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-br from-primary to-accent" />
                    )}

                    <div className={`flex min-h-[15rem] flex-col justify-end gap-3 p-6 sm:min-h-[22rem] sm:p-10 ${tone}`}>
                        {category.productCount > 0 && (
                            <span className="px-3 py-1 text-xs font-semibold rounded-full w-fit bg-white/20 backdrop-blur-sm">
                                {t('catalog_productsCount', { n: category.productCount })}
                            </span>
                        )}
                        <h1 className="text-3xl font-extrabold leading-[1.4] sm:text-5xl">{category.name}</h1>
                        {category.summary && <p className="max-w-3xl text-base leading-8 opacity-90 sm:text-lg">{category.summary}</p>}
                    </div>
                </header>

                {(category.description || category.allowOrderRequest || (category.badges && category.badges.length > 0)) && (
                    <section aria-label={t('catalog_overview')} className="grid gap-8 mt-10 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            <Badges items={category.badges} limit={6} className="mb-5" />
                            <RichText text={category.description} />
                        </div>
                        {/* {category.allowOrderRequest && (
                            <div className="p-6 border h-fit rounded-theme border-border bg-surface lg:sticky lg:top-28">
                                <RequestButton
                                    className="w-full"
                                    product={{
                                        _id: category._id,
                                        slug: category.slug,
                                        name: category.name,
                                        ctaLabel: category.ctaLabel,
                                        options: category.options || [],
                                        allowOrderRequest: category.allowOrderRequest
                                    }}
                                />
                            </div>
                        )} */}
                    </section>
                )}

                {category.features && category.features.length > 0 && (
                    <section aria-labelledby="category-features" className="mt-16">
                        <h2 id="category-features" className="mb-6 text-2xl font-extrabold sm:text-3xl">
                            {t('catalog_features')}
                        </h2>
                        <FeatureGrid features={category.features} />
                    </section>
                )}

                {subcategories.length > 0 && (
                    <section aria-labelledby="category-children" className="mt-16">
                        <h2 id="category-children" className="mb-6 text-2xl font-extrabold sm:text-3xl">
                            {t('catalog_subcategories')}
                        </h2>
                        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {subcategories.map((child, index) => (
                                <Reveal key={child._id} as="li" delay={(index % 3) * 0.08} className="h-full">
                                    <CategoryCard category={child} labels={labels} meta={metaOf(child)} className="h-full" />
                                </Reveal>
                            ))}
                        </ul>
                    </section>
                )}

                {category.productCount > 0 && (
                    <section aria-labelledby="category-products" className="mt-16">
                        <h2 id="category-products" className="mb-6 text-2xl font-extrabold sm:text-3xl">
                            {t('catalog_productsIn')}
                        </h2>
                        <CategoryProducts slug={category.slug} initial={initial} />
                    </section>
                )}

                {category.documents && category.documents.length > 0 && (
                    <section aria-labelledby="category-documents" className="mt-16">
                        <h2 id="category-documents" className="mb-6 text-2xl font-extrabold sm:text-3xl">
                            {t('catalog_documents')}
                        </h2>
                        <DocumentsList documents={category.documents} label={t('catalog_download')} />
                    </section>
                )}

                {!hasContent && <p className="mt-16 text-center text-muted">{t('catalog_empty')}</p>}
            </div>
        </main>
    );
}