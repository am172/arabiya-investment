import CatalogBreadcrumbs from '@/components/catalog/CatalogBreadcrumbs';
import CatalogSearch from '@/components/catalog/CatalogSearch';
import CategoryCard from '@/components/catalog/CategoryCard';
import ProductCard from '@/components/catalog/ProductCard';
import Reveal from '@/components/ui/Reveal';
import SectionTitle from '@/components/ui/SectionTitle';
import { getCategories, getFeaturedProducts } from '@/lib/api/catalog';
import { getSettings } from '@/lib/api/settings';
import { getT } from '@/lib/serverTexts';
import { getHeadings } from '@/lib/headings';

const HERO_IMAGE = '/images/Group19.png';

export const revalidate = 60;

export async function generateMetadata() {
    const [settings, t] = await Promise.all([getSettings(), getT()]);
    const name = (settings && settings.siteName) || '';

    return {
        title: t('catalog_metaTitle'),
        description: t('catalog_metaDescription', { name }),
        alternates: { canonical: '/products' }
    };
}

export default async function ProductsPage() {
    const [categories, featured, t] = await Promise.all([getCategories(), getFeaturedProducts(4), getT()]);
    const heading = getHeadings(t).productsHero;
    const labels = {
        view: t('catalog_viewCategory'),
        productLabel: t('catalog_viewProduct'),
        featured: t('catalog_featured')
    };

    const metaOf = (category) => {
        if (category.productCount > 0) return t('catalog_productsCount', { n: category.productCount });
        if (category.childrenCount > 0) return t('catalog_itemsCount', { n: category.childrenCount });
        return '';
    };

    return (
        <main dir="rtl" lang="ar" className="min-h-[80svh] bg-background pb-24">
            <header className="relative pt-32 pb-12 overflow-hidden isolate sm:pt-40 sm:pb-16">
                <div aria-hidden="true" className="absolute inset-0 pointer-events-none -z-10">
                    <div
                        className="absolute inset-0 bg-center bg-no-repeat bg-cover dark:invert dark:hue-rotate-180 dark:opacity-40"
                        style={{ backgroundImage: `url(${HERO_IMAGE})` }}
                    />
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
                </div>

                <div className="relative px-5 mx-auto max-w-7xl sm:px-8">
                    <CatalogBreadcrumbs
                        label={t('catalog_breadcrumbs')}
                        className="mb-8"
                        items={[
                            { name: t('catalog_home'), href: '/' },
                            { name: t('catalog_metaTitle'), href: '/products' }
                        ]}
                    />

                    <h1 className="sr-only">{`${heading.title} ${heading.highlight}`.trim()}</h1>
                    <SectionTitle {...heading} />
                </div>
            </header>

            <div className="px-5 mx-auto max-w-7xl sm:px-8">
                <CatalogSearch
                    labels={{
                        aria: t('catalog_searchLabel'),
                        placeholder: t('catalog_search'),
                        noResults: t('catalog_noResults'),
                        clear: t('request_close')
                    }}
                >
                    {categories.length === 0 ? (
                        <p className="py-16 text-center text-muted">{t('catalog_emptyAll')}</p>
                    ) : (
                        <div className="space-y-20">
                            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {categories.map((category, index) => (
                                    <Reveal key={category._id} as="li" delay={(index % 3) * 0.08} className="h-full">
                                        <CategoryCard
                                            category={category}
                                            labels={labels}
                                            meta={metaOf(category)}
                                            priority={index < 3}
                                            className="h-full"
                                        />
                                    </Reveal>
                                ))}
                            </ul>

                            {featured.length > 0 && (
                                <section aria-labelledby="featured-heading">
                                    <h2 id="featured-heading" className="mb-8 text-2xl font-extrabold sm:text-3xl">
                                        {t('featuredProducts_title')}{' '}
                                        <span className="text-transparent bg-gradient-to-l from-primary via-accent to-secondary bg-clip-text">
                                            {t('featuredProducts_highlight')}
                                        </span>
                                    </h2>
                                    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                                        {featured.map((product, index) => (
                                            <Reveal key={product._id} as="li" delay={(index % 4) * 0.07} className="h-full">
                                                <ProductCard product={product} labels={{ view: labels.productLabel, featured: labels.featured }} />
                                            </Reveal>
                                        ))}
                                    </ul>
                                </section>
                            )}
                        </div>
                    )}
                </CatalogSearch>
            </div>
        </main>
    );
}