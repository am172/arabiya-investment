import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Package } from 'lucide-react';
import Button from '@/components/ui/Button';
import Reveal from '@/components/ui/Reveal';
import SectionTitle from '@/components/ui/SectionTitle';
import DotsBackground from '@/components/ui/DotsBackground';
import { Badges, productHref } from '@/components/catalog/ProductCard';
import ProductCarousel from '@/components/catalog/ProductCarousel';
import RequestButton from '@/components/catalog/RequestButton';
import { getT } from '@/lib/serverTexts';
import { getHeadings } from '@/lib/headings';

const SPANS = {
    1: [6],
    2: [3, 3],
    3: [2, 2, 2],
    4: [3, 3, 3, 3],
    5: [2, 2, 2, 3, 3]
};

const SPAN_CLASS = {
    2: 'lg:col-span-2',
    3: 'lg:col-span-3',
    6: 'lg:col-span-6'
};

const tileLayout = (index, count) => {
    const span = SPAN_CLASS[SPANS[count][index]];
    const topRow = count >= 4 && index < (count === 4 ? 2 : 3);
    const height = count < 4 ? 'lg:h-[22rem]' : topRow ? 'lg:h-[16rem]' : 'lg:h-[21rem]';

    return `${span} ${height}`;
};

const REVEAL_TOP =
    'transition-all duration-500 ease-out lg:-translate-y-8 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-focus-within:translate-y-0 lg:group-focus-within:opacity-100';

const REVEAL_BOTTOM =
    'transition-all duration-500 ease-out lg:translate-y-8 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-focus-within:translate-y-0 lg:group-focus-within:opacity-100';

function Arrow() {
    return <ArrowRight size={16} aria-hidden="true" className="rtl:-scale-x-100" />;
}

function Tile({ product, labels }) {
    const cover = product.cover && product.cover.url;

    return (
        <article className="relative w-full h-full overflow-hidden transition-colors duration-500 border group rounded-theme border-border bg-surface hover:border-primary/60 focus-within:border-primary/60">
            {cover ? (
                <Image
                    src={cover}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 40vw, (min-width: 640px) 50vw, 95vw"
                    className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110 group-focus-within:scale-110"
                />
            ) : (
                <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/15 to-accent/10 text-primary/30">
                    <Package size={64} />
                </div>
            )}

            <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 transition-opacity duration-500 h-3/5 bg-gradient-to-t from-background/90 via-background/50 to-transparent lg:from-background/80 lg:via-background/25 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100"
            />

            <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 transition-opacity duration-500 h-2/5 bg-gradient-to-b from-background/60 to-transparent lg:from-background/55 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100"
            />

            <div className="absolute inset-0 flex flex-col justify-between p-5 sm:p-6">
                <div className={`flex flex-col items-start gap-2 ${REVEAL_TOP}`}>
                    <Badges items={product.badges} />
                    {product.path && product.path.length > 0 && (
                        <p className="text-xs font-semibold text-primary">{product.path.join(' › ')}</p>
                    )}
                    <h3 className="text-lg font-extrabold leading-snug text-foreground sm:text-xl">
                        <Link href={productHref(product)} className="transition hover:text-primary focus-visible:outline-none focus-visible:text-primary">
                            {product.name}
                        </Link>
                    </h3>
                </div>

                <div className="flex flex-col gap-4">
                    {product.summary && (
                        <p className={`text-sm font-semibold leading-7 text-foreground line-clamp-2 lg:line-clamp-3 delay-100 ${REVEAL_BOTTOM}`}>
                            {product.summary}
                        </p>
                    )}
                    <div className={`flex flex-wrap gap-2 delay-200 ${REVEAL_BOTTOM}`}>
                        <RequestButton product={product} size="md" />
                        <Link
                            href={productHref(product)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold transition border rounded-full border-border bg-background text-foreground hover:border-primary hover:text-primary"
                        >
                            {labels.view}
                            <Arrow />
                        </Link>
                    </div>
                </div>
            </div>
        </article>
    );
}

export default async function FeaturedProductsSection({ products, variant = 'mosaic' }) {
    if (!products || products.length === 0) return null;

    const t = await getT();
    const heading = getHeadings(t).featuredProducts;
    const labels = {
        view: t('catalog_viewProduct'),
        featured: t('catalog_featured'),
        prev: t('carousel_prev'),
        next: t('carousel_next'),
        region: `${heading.title} ${heading.highlight}`.trim()
    };

    const items = products.slice(0, 5);

    return (
        <section
            id="featuredProducts"
            className="relative py-20 overflow-hidden scroll-mt-20 border-y border-border bg-surface sm:py-28"
        >
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
                <DotsBackground />
                <div className="absolute inset-0 bg-gradient-to-b from-surface via-transparent to-surface" />
                <div className="absolute -start-24 top-1/4 h-96 w-96 rounded-full bg-accent/10 blur-[140px]" />
                <div className="absolute -end-24 bottom-0 h-96 w-96 rounded-full bg-primary/10 blur-[140px]" />
            </div>

            <div className="relative z-10 px-5 mx-auto max-w-7xl sm:px-8">
                <SectionTitle {...heading} />

                <div className="mt-14">
                    {variant === 'carousel' ? (
                        <ProductCarousel products={products} labels={labels} />
                    ) : (
                        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-6">
                            {items.map((product, index) => (
                                <Reveal
                                    key={product._id}
                                    as="li"
                                    delay={(index % 3) * 0.08}
                                    className={`h-72 sm:max-lg:[&:last-child:nth-child(odd)]:col-span-2 ${tileLayout(index, items.length)}`}
                                >
                                    <Tile product={product} labels={labels} />
                                </Reveal>
                            ))}
                        </ul>
                    )}
                </div>

                <Reveal delay={0.1} className="flex justify-center mt-12">
                    <Button href="/products" variant="outline" size="lg">
                        {t('featuredProducts_cta')}
                    </Button>
                </Reveal>
            </div>
        </section>
    );
}