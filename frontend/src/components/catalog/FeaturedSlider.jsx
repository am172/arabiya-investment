'use client';

import { Children, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function FeaturedSlider({ children, title, highlight }) {
    const sliderRef = useRef(null);
    const [isPaused, setIsPaused] = useState(false);
    const items = Children.toArray(children);

    const scrollNext = () => {
        const el = sliderRef.current;
        if (!el || !el.firstElementChild || !el.lastElementChild) return;

        const containerRect = el.getBoundingClientRect();
        const lastRect = el.lastElementChild.getBoundingClientRect();

        if (lastRect.left >= containerRect.left - 20) {
            el.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
            const cardWidth = el.firstElementChild.getBoundingClientRect().width;
            el.scrollBy({ left: -(cardWidth + 20), behavior: 'smooth' });
        }
    };

    const scrollPrev = () => {
        const el = sliderRef.current;
        if (!el || !el.firstElementChild) return;

        const cardWidth = el.firstElementChild.getBoundingClientRect().width;
        el.scrollBy({ left: cardWidth + 20, behavior: 'smooth' });
    };

    useEffect(() => {
        if (isPaused || items.length <= 4) return undefined;
        const timer = setInterval(scrollNext, 3500);
        return () => clearInterval(timer);
    }, [isPaused, items.length]);

    return (
        <section
            aria-labelledby="featured-heading"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
        >
            <div className="mb-8 flex items-center justify-between gap-4">
                <h2 id="featured-heading" className="text-2xl font-extrabold sm:text-3xl">
                    {title}{' '}
                    <span className="bg-gradient-to-l from-primary via-accent to-secondary bg-clip-text text-transparent">
                        {highlight}
                    </span>
                </h2>

                {items.length > 1 && (
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={scrollPrev}
                            aria-label="السابق"
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-foreground transition hover:border-primary hover:bg-primary/10 hover:text-primary"
                        >
                            <ChevronRight size={20} />
                        </button>
                        <button
                            type="button"
                            onClick={scrollNext}
                            aria-label="التالي"
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-foreground transition hover:border-primary hover:bg-primary/10 hover:text-primary"
                        >
                            <ChevronLeft size={20} />
                        </button>
                    </div>
                )}
            </div>

            <div
                ref={sliderRef}
                className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {items.map((child, index) => (
                    <div
                        key={index}
                        className="w-[82%] shrink-0 snap-start sm:w-[calc(50%-10px)] lg:w-[calc(25%-15px)]"
                    >
                        {child}
                    </div>
                ))}
            </div>
        </section>
    );
}