import CatalogBreadcrumbs from '@/components/catalog/CatalogBreadcrumbs';
import CatalogSearch from '@/components/catalog/CatalogSearch';
import CategoryCard from '@/components/catalog/CategoryCard';
import ProductCard from '@/components/catalog/ProductCard';
import FeaturedSlider from '@/components/catalog/FeaturedSlider';
import Reveal from '@/components/ui/Reveal';
import SectionTitle from '@/components/ui/SectionTitle';
import * as catalogApi from '@/lib/api/catalog';
import { getSettings } from '@/lib/api/settings';
import { getT } from '@/lib/serverTexts';
import { getHeadings } from '@/lib/headings';

const HERO_IMAGE = '/images/Group19.png';

export const revalidate = 60;

async function fetchAllCatalogProducts(categories = [], featured = []) {
    const api = { ...catalogApi };

    if (typeof api.getAllProducts === 'function') {
        const res = await api.getAllProducts(200);
        if (Array.isArray(res) && res.length > 0) return res;
    }

    if (typeof api.getProducts === 'function') {
        const res = await api.getProducts(200);
        if (Array.isArray(res) && res.length > 0) return res;
    }

    if (typeof api.searchCatalog === 'function') {
        const res = await api.searchCatalog('', { kind: 'product', limit: 200 });
        if (Array.isArray(res) && res.length > 0) return res;
    }

    const baseUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        process.env.API_URL ||
        'http://localhost:5000/api';

    const endpoints = [
        `${baseUrl.replace(/\/$/, '')}/catalog?kind=product&parent=all&limit=200`,
        `${baseUrl.replace(/\/$/, '')}/catalog/products?limit=200`
    ];

    for (const url of endpoints) {
        try {
            const response = await fetch(url, { next: { revalidate: 60 } });
            if (response.ok) {
                const json = await response.json();
                const list = Array.isArray(json)
                    ? json
                    : Array.isArray(json?.data)
                      ? json.data
                      : Array.isArray(json?.products)
                        ? json.products
                        : Array.isArray(json?.items)
                          ? json.items
                          : [];
                const onlyProducts = list.filter(
                    (item) => !item.kind || item.kind === 'product'
                );
                if (onlyProducts.length > 0) return onlyProducts;
            }
        } catch (error) {
            continue;
        }
    }

    const collected = new Map();
    const walk = (nodes) => {
        if (!Array.isArray(nodes)) return;
        nodes.forEach((node) => {
            if (!node) return;
            if (node.kind === 'product' && node._id) {
                collected.set(String(node._id), node);
            }
            if (Array.isArray(node.products)) walk(node.products);
            if (Array.isArray(node.children)) walk(node.children);
        });
    };

    walk(categories);
    featured.forEach((item) => {
        if (item && item._id) collected.set(String(item._id), item);
    });

    return Array.from(collected.values());
}

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
    const [categories, featured, t] = await Promise.all([
        catalogApi.getCategories(),
        catalogApi.getFeaturedProducts(100),
        getT()
    ]);

    const allProducts = await fetchAllCatalogProducts(categories, featured);

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
        <main className="min-h-[80svh] bg-background pb-24">
            <header className="relative isolate overflow-hidden pb-12 pt-32 sm:pb-16 sm:pt-40">
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat dark:hue-rotate-180 dark:invert dark:opacity-40"
                        style={{ backgroundImage: `url(${HERO_IMAGE})` }}
                    />
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
                </div>

                <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
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

            <div className="mx-auto max-w-7xl px-5 sm:px-8">
                <CatalogSearch
                    labels={{
                        aria: t('catalog_searchLabel'),
                        placeholder: t('catalog_search'),
                        noResults: t('catalog_noResults'),
                        clear: t('request_close')
                    }}
                >
                    {categories.length === 0 && allProducts.length === 0 ? (
                        <p className="py-16 text-center text-muted">{t('catalog_emptyAll')}</p>
                    ) : (
                        <div className="space-y-20">
                            {categories.length > 0 && (
                                <section aria-labelledby="categories-heading">
                                    <div className="mb-8">
                                        <h2
                                            id="categories-heading"
                                            className="text-2xl font-extrabold sm:text-3xl"
                                        >
                                            أقسام{' '}
                                            <span className="bg-gradient-to-l from-primary via-accent to-secondary bg-clip-text text-transparent">
                                                المنتجات
                                            </span>
                                        </h2>
                                    </div>

                                    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                        {categories.map((category, index) => (
                                            <Reveal
                                                key={category._id}
                                                as="li"
                                                delay={(index % 3) * 0.08}
                                                className="h-full"
                                            >
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
                                </section>
                            )}

                            {featured.length > 0 && (
                                <FeaturedSlider
                                    title={t('featuredProducts_title')}
                                    highlight={t('featuredProducts_highlight')}
                                >
                                    {featured.map((product) => (
                                        <div key={product._id} className="h-full">
                                            <ProductCard
                                                product={product}
                                                labels={{
                                                    view: labels.productLabel,
                                                    featured: labels.featured
                                                }}
                                            />
                                        </div>
                                    ))}
                                </FeaturedSlider>
                            )}

                            {allProducts.length > 0 && (
                                <section aria-labelledby="all-products-heading">
                                    <div className="mb-8">
                                        <h2
                                            id="all-products-heading"
                                            className="text-2xl font-extrabold sm:text-3xl"
                                        >
                                            كل{' '}
                                            <span className="bg-gradient-to-l from-primary via-accent to-secondary bg-clip-text text-transparent">
                                                المنتجات
                                            </span>
                                        </h2>
                                    </div>

                                    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                                        {allProducts.map((product, index) => (
                                            <Reveal
                                                key={product._id}
                                                as="li"
                                                delay={(index % 4) * 0.07}
                                                className="h-full"
                                            >
                                                <ProductCard
                                                    product={product}
                                                    labels={{
                                                        view: labels.productLabel,
                                                        featured: labels.featured
                                                    }}
                                                />
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