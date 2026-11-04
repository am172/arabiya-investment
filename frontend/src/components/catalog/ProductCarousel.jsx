'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '@/components/catalog/ProductCard';

const BUTTON =
    'flex h-12 w-12 items-center justify-center rounded-full border border-border bg-surface transition hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 active:scale-90';

export default function ProductCarousel({ products, labels }) {
    const trackRef = useRef(null);
    const [canScroll, setCanScroll] = useState(false);

    useEffect(() => {
        const node = trackRef.current;
        if (!node) return undefined;

        const update = () => setCanScroll(node.scrollWidth > node.clientWidth + 4);
        update();
        const observer = new ResizeObserver(update);
        observer.observe(node);
        return () => observer.disconnect();
    }, [products.length]);

    const scrollPage = useCallback((direction) => {
        const node = trackRef.current;
        if (!node) return;

        const rtl = getComputedStyle(node).direction === 'rtl';
        const first = node.firstElementChild;
        const step = first ? first.getBoundingClientRect().width + 20 : node.clientWidth * 0.8;
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        node.scrollBy({ left: direction * step * (rtl ? -1 : 1), behavior: reduce ? 'auto' : 'smooth' });
    }, []);

    return (
        <div role="region" aria-roledescription="carousel" aria-label={labels.region}>
            <ul
                ref={trackRef}
                tabIndex={0}
                className="flex snap-x snap-mandatory gap-5 overflow-x-auto rounded-theme pb-4 [scrollbar-width:none] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary [&::-webkit-scrollbar]:hidden"
            >
                {products.map((product) => (
                    <li key={product._id} className="w-[78%] shrink-0 snap-start sm:w-[46%] lg:w-[31%] xl:w-[23.5%]">
                        <ProductCard product={product} labels={labels} />
                    </li>
                ))}
            </ul>

            {canScroll && (
                <div className="flex justify-center gap-3 mt-6">
                    <button type="button" aria-label={labels.prev} onClick={() => scrollPage(-1)} className={BUTTON}>
                        <ChevronLeft size={20} aria-hidden="true" className="rtl:rotate-180" />
                    </button>
                    <button type="button" aria-label={labels.next} onClick={() => scrollPage(1)} className={BUTTON}>
                        <ChevronRight size={20} aria-hidden="true" className="rtl:rotate-180" />
                    </button>
                </div>
            )}
        </div>
    );
}