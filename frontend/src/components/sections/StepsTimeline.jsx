'use client';

import { useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import Icon from '@/components/ui/Icon';
import SectionTitle from '@/components/ui/SectionTitle';
import { useT } from '@/components/providers/TextsProvider';

const VIEWPORT = { once: true, margin: '-80px' };

export default function StepsTimeline({ steps, heading }) {
    const t = useT();
    const listRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 75%', 'end 55%'] });
    const scaleY = useSpring(scrollYProgress, { stiffness: 110, damping: 28, restDelta: 0.001 });

    if (!steps || steps.length === 0) return null;

    const { eyebrow, title, highlight } = heading;

    return (
        <section
            id="steps"
            className="relative py-20 overflow-hidden scroll-mt-20 border-y border-border bg-surface sm:py-28"
        >
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
                <div className="absolute -start-24 top-1/4 h-96 w-96 rounded-full bg-primary/10 blur-[130px]" />
                <div className="absolute -end-24 bottom-1/4 h-96 w-96 rounded-full bg-secondary/10 blur-[130px]" />
            </div>

            <div className="relative px-5 mx-auto max-w-7xl sm:px-8">
                <SectionTitle eyebrow={eyebrow} title={title} highlight={highlight} />

                <ol ref={listRef} className="relative max-w-4xl mx-auto mt-16">
                    <span
                        aria-hidden="true"
                        className="absolute bottom-0 start-5 top-0 w-0.5 -translate-x-1/2 overflow-hidden rounded-full bg-border rtl:translate-x-1/2 md:start-1/2"
                    >
                        <motion.span
                            style={{ scaleY }}
                            className="block w-full h-full origin-top bg-gradient-to-b from-primary to-accent"
                        />
                    </span>

                    {steps.map((step, index) => {
                        const alternate = index % 2 === 1;
                        return (
                            <li
                                key={`${step.title}-${index}`}
                                className="relative pb-12 ps-14 last:pb-0 md:grid md:grid-cols-2 md:ps-0"
                            >
                                <span
                                    aria-hidden="true"
                                    className="absolute z-10 -translate-x-1/2 start-5 top-6 rtl:translate-x-1/2 md:start-1/2"
                                >
                                    <motion.span
                                        initial={{ scale: 0, opacity: 0 }}
                                        whileInView={{ scale: 1, opacity: 1 }}
                                        viewport={VIEWPORT}
                                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                        className="flex items-center justify-center w-10 h-10 text-sm font-bold border-4 rounded-full shadow-lg border-surface bg-primary font-heading text-primary-foreground shadow-primary/30"
                                    >
                                        {index + 1}
                                    </motion.span>
                                </span>

                                <motion.div
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={VIEWPORT}
                                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                                    className={`rounded-theme border border-border bg-background p-6 shadow-sm shadow-primary/5 sm:p-7 ${alternate ? 'md:col-start-2 md:ms-12' : 'md:col-start-1 md:me-12'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="flex items-center justify-center h-11 w-11 rounded-2xl bg-primary/10 text-primary dark:bg-primary dark:text-primary-foreground">
                                            <Icon name={step.icon} />
                                        </span>
                                        <span className="text-xs font-semibold text-muted">
                                            {t('steps_step', { n: index + 1 })}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold">{step.title}</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">{step.text}</p>
                                </motion.div>
                            </li>
                        );
                    })}
                </ol>
            </div>
        </section>
    );
}