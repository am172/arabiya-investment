import Button from '@/components/ui/Button';
import Reveal from '@/components/ui/Reveal';
import SectionTitle from '@/components/ui/SectionTitle';
import CategoryCard from '@/components/catalog/CategoryCard';
import { getT } from '@/lib/serverTexts';
import { getHeadings } from '@/lib/headings';

const LIMIT = 9;
const FIRST_BLOCK = 5;
const NEXT_BLOCK = 6;

const SLOTS = [
    { s: '51.94%', w: '48.06%', t: '0%', h: '36.21%', size: 'md' },
    { s: '0%', w: '42.83%', t: '22.7%', h: '42.24%', size: 'md' },
    { s: '44.77%', w: '55.23%', t: '38.51%', h: '26.44%', size: 'md' },
    { s: '51.16%', w: '48.84%', t: '67.24%', h: '32.76%', size: 'md' },
    { s: '0%', w: '49.81%', t: '67.24%', h: '32.76%', size: 'md' },
    { s: '0%', w: '49.42%', t: '0%', h: '20.4%', size: 'sm' }
];

const HEADING_SLOT = SLOTS[5];

const slotStyle = (slot) => ({
    '--s': slot.s,
    '--w': slot.w,
    '--t': slot.t,
    '--h': slot.h
});

const slotClass =
    'lg:absolute lg:start-[var(--s)] lg:top-[var(--t)] lg:w-[var(--w)] lg:h-[var(--h)]';

const headingClass =
    'flex flex-col justify-center [&>*]:!mb-0 [&>*]:!mt-0 [&_h1]:!text-[clamp(1.5rem,3.1cqw,2.4rem)] [&_h2]:!text-[clamp(1.5rem,3.1cqw,2.4rem)] [&_h3]:!text-[clamp(1.5rem,3.1cqw,2.4rem)] [&_h1]:!leading-tight [&_h2]:!leading-tight [&_h3]:!leading-tight [&_p]:!mt-2 [&_p]:!text-[clamp(0.75rem,1.15cqw,0.95rem)] [&_p]:!leading-relaxed [&_p]:line-clamp-3';

const splitIntoBlocks = (list) => {
    const blocks = [];
    let index = 0;
    while (index < list.length) {
        const size = blocks.length === 0 ? FIRST_BLOCK : NEXT_BLOCK;
        blocks.push(list.slice(index, index + size));
        index += size;
    }
    return blocks;
};

export default async function CategoriesSection({ categories, variant = 'grid' }) {
    if (!categories || categories.length === 0) return null;

    const t = await getT();
    const heading = getHeadings(t).categories;
    const labels = { view: t('catalog_viewCategory') };
    const items = variant === 'showcase' ? categories : categories.slice(0, LIMIT);

    const metaOf = (category) => {
        if (category.productCount > 0) return t('catalog_productsCount', { n: category.productCount });
        if (category.childrenCount > 0) return t('catalog_itemsCount', { n: category.childrenCount });
        return '';
    };

    const blocks = variant === 'showcase' ? splitIntoBlocks(items) : [];
    const firstBlockFull = blocks.length > 0 && blocks[0].length === FIRST_BLOCK;

    return (
        <section id="categories" className="relative py-20 overflow-hidden scroll-mt-20 bg-background sm:py-28">
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-grid mask-fade opacity-40 dark:opacity-20" />
                <div className="absolute -end-24 top-1/3 h-96 w-96 rounded-full bg-primary/10 blur-[140px]" />
            </div>

            <div className="relative px-5 mx-auto max-w-7xl sm:px-8">
                {!(variant === 'showcase' && firstBlockFull) && <SectionTitle {...heading} />}

                {variant === 'showcase' ? (
                    <div className={`flex flex-col gap-4 lg:gap-5 ${firstBlockFull ? '' : 'mt-14'}`}>
                        {blocks.map((chunk, blockIndex) => {
                            const full = chunk.length === (blockIndex === 0 ? FIRST_BLOCK : NEXT_BLOCK);

                            if (!full) {
                                return (
                                    <div key={blockIndex} className="flex flex-wrap justify-center gap-4">
                                        {chunk.map((category, index) => (
                                            <div
                                                key={category._id}
                                                className="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.667rem)]"
                                            >
                                                <Reveal delay={index * 0.08} className="h-full">
                                                    <CategoryCard
                                                        category={category}
                                                        labels={labels}
                                                        meta={metaOf(category)}
                                                        variant="bento"
                                                        className="h-64"
                                                    />
                                                </Reveal>
                                            </div>
                                        ))}
                                    </div>
                                );
                            }

                            return (
                                <div
                                    key={blockIndex}
                                    className="relative grid grid-cols-2 gap-3 [container-type:inline-size] lg:block lg:aspect-[516/348] lg:gap-0"
                                >
                                    {blockIndex === 0 && (
                                        <div
                                            style={slotStyle(HEADING_SLOT)}
                                            className={`col-span-2 mb-4 lg:mb-0 ${headingClass} ${slotClass}`}
                                        >
                                            <SectionTitle {...heading} />
                                        </div>
                                    )}
                                    {chunk.map((category, index) => {
                                        const slot = SLOTS[index];
                                        return (
                                            <div
                                                key={category._id}
                                                style={slotStyle(slot)}
                                                className={`${index === 0 ? 'col-span-2' : ''} ${slotClass}`}
                                            >
                                                <Reveal delay={(index % 3) * 0.08} className="h-full">
                                                    <CategoryCard
                                                        category={category}
                                                        labels={labels}
                                                        meta={metaOf(category)}
                                                        variant="bento"
                                                        size={slot.size}
                                                        className="h-full"
                                                    />
                                                </Reveal>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <ul className="grid gap-5 mt-14 sm:grid-cols-2 lg:grid-cols-3">
                        {items.map((category, index) => (
                            <Reveal key={category._id} as="li" delay={(index % 3) * 0.08} className="h-full">
                                <CategoryCard
                                    category={category}
                                    labels={labels}
                                    meta={metaOf(category)}
                                    variant={variant === 'tiles' ? 'tile' : 'card'}
                                    className="h-full"
                                />
                            </Reveal>
                        ))}
                    </ul>
                )}

                <Reveal delay={0.1} className="flex justify-center mt-12">
                    <Button href="/products" variant="outline" size="lg">
                        {t('categories_cta')}
                    </Button>
                </Reveal>
            </div>
        </section>
    );
}