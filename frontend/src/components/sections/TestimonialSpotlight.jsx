'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';

export default function TestimonialSpotlight({ testimonials, starsLabel }) {
    const items = testimonials.slice(0, 8);
    const reduced = useReducedMotion();
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        if (paused || reduced || items.length < 2) return undefined;
        const timer = setInterval(() => setIndex((value) => (value + 1) % items.length), 7000);
        return () => clearInterval(timer);
    }, [paused, reduced, items.length]);

    const item = items[index];
    const rating = Math.max(1, Math.min(5, Number(item.rating) || 5));

    return (
        <div
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            className="max-w-3xl mx-auto text-center mt-14"
        >
            <Quote size={44} aria-hidden="true" className="mx-auto mb-6 text-primary/30" />

            <div className="min-h-[15rem]">
                <AnimatePresence mode="wait">
                    <motion.figure
                        key={item._id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div role="img" aria-label={starsLabel.replace('{n}', rating)} className="flex justify-center gap-1 mb-5">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    size={20}
                                    aria-hidden="true"
                                    className={star <= rating ? 'fill-amber-400 text-amber-400' : 'text-border'}
                                />
                            ))}
                        </div>
                        <blockquote className="text-xl font-semibold leading-9 sm:text-3xl sm:leading-[1.7]">
                            {item.content}
                        </blockquote>
                        <figcaption className="mt-6">
                            <span className="block font-bold">{item.name}</span>
                            {item.role && <span className="block text-sm text-muted">{item.role}</span>}
                        </figcaption>
                    </motion.figure>
                </AnimatePresence>
            </div>

            <div className="flex flex-wrap justify-center gap-3 mt-8">
                {items.map((entry, position) => (
                    <button
                        key={entry._id}
                        type="button"
                        aria-label={entry.name}
                        aria-current={position === index}
                        onClick={() => setIndex(position)}
                        className={`overflow-hidden rounded-full transition ${position === index ? 'scale-110 ring-2 ring-primary ring-offset-2 ring-offset-background' : 'opacity-50 hover:opacity-100'
                            }`}
                    >
                        {entry.avatar && entry.avatar.url ? (
                            <Image src={entry.avatar.url} alt="" width={44} height={44} className="object-cover h-11 w-11" />
                        ) : (
                            <span className="flex items-center justify-center font-bold h-11 w-11 bg-gradient-to-br from-primary to-accent font-heading text-primary-foreground">
                                {entry.name.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}