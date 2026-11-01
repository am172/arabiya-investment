'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import TeacherCard from '@/components/cards/TeacherCard';
import Button from '@/components/ui/Button';
import Reveal from '@/components/ui/Reveal';
import SectionTitle from '@/components/ui/SectionTitle';
import { useT } from '@/components/providers/TextsProvider';

const PAUSE_MS = 2000;
const TRANSITION_MS = 550;

export default function TeachersSection({ teachers, heading }) {
    const t = useT();
    const listRef = useRef(null);
    const indexRef = useRef(0);
    const stepPxRef = useRef(0);
    const touchStartX = useRef(null);
    const touchStartY = useRef(null);
    const isDragging = useRef(false);

    const [isDesktop, setIsDesktop] = useState(false);
    const [paused, setPaused] = useState(false);

    const hasTeachers = Boolean(teachers && teachers.length > 0);
    const shouldLoop = hasTeachers ? (isDesktop ? teachers.length > 4 : teachers.length > 1) : false;

    const baseItems = useMemo(() => {
        if (!hasTeachers) return [];
        if (!shouldLoop) return teachers;
        const result = [...teachers];
        while (result.length < 5) {
            result.push(...teachers);
        }
        return result;
    }, [teachers, hasTeachers, shouldLoop]);

    const baseLen = baseItems.length;

    const displayItems = useMemo(() => {
        if (!shouldLoop) return baseItems;
        return [
            ...baseItems,
            ...baseItems,
            ...baseItems,
            ...baseItems,
            ...baseItems
        ];
    }, [baseItems, shouldLoop]);

    const applyTransform = useCallback((px, animate) => {
        const list = listRef.current;
        if (!list) return;
        list.style.transition = animate
            ? `transform ${TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`
            : 'none';
        list.style.transform = shouldLoop ? `translate3d(${px}px, 0, 0)` : 'none';
    }, [shouldLoop]);

    const normalizePosition = useCallback(() => {
        const list = listRef.current;
        const stepPx = stepPxRef.current;
        if (!list || !shouldLoop || baseLen === 0 || stepPx === 0) return;

        const currentIdx = indexRef.current;
        if (currentIdx >= baseLen * 2 && currentIdx < baseLen * 3) return;

        const wrappedIdx = (((currentIdx % baseLen) + baseLen) % baseLen) + baseLen * 2;
        const diff = wrappedIdx - currentIdx;

        const matrix = new DOMMatrixReadOnly(window.getComputedStyle(list).transform);
        const currentX = matrix.m41 || 0;

        list.style.transition = 'none';
        list.style.transform = `translate3d(${currentX + diff * stepPx}px, 0, 0)`;
        void list.offsetHeight;

        indexRef.current = wrappedIdx;
    }, [shouldLoop, baseLen]);

    const moveBy = useCallback((delta) => {
        if (!shouldLoop || stepPxRef.current === 0) return;
        normalizePosition();
        indexRef.current += delta;
        applyTransform(indexRef.current * stepPxRef.current, true);
    }, [shouldLoop, normalizePosition, applyTransform]);

    const goNext = useCallback(() => moveBy(1), [moveBy]);
    const goPrev = useCallback(() => moveBy(-1), [moveBy]);

    useEffect(() => {
        const mq = window.matchMedia('(min-width: 1024px)');
        const onChange = (e) => setIsDesktop(e.matches);
        setIsDesktop(mq.matches);
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, []);

    const measure = useCallback(() => {
        const list = listRef.current;
        if (!list || list.children.length < 2) {
            stepPxRef.current = 0;
            return;
        }
        const first = list.children[0];
        const second = list.children[1];
        const distance = Math.abs(second.offsetLeft - first.offsetLeft);
        stepPxRef.current = distance;
        applyTransform(indexRef.current * distance, false);
    }, [applyTransform]);

    useEffect(() => {
        indexRef.current = shouldLoop ? baseLen * 2 : 0;
        measure();
    }, [shouldLoop, baseLen, measure]);

    useEffect(() => {
        measure();
        const list = listRef.current;
        if (!list) return undefined;

        const ro = new ResizeObserver(measure);
        ro.observe(list);
        window.addEventListener('resize', measure);
        return () => {
            ro.disconnect();
            window.removeEventListener('resize', measure);
        };
    }, [measure, displayItems]);

    useEffect(() => {
        if (!shouldLoop || paused) return undefined;
        const timer = setInterval(() => {
            goNext();
        }, PAUSE_MS);
        return () => clearInterval(timer);
    }, [shouldLoop, paused, goNext]);

    const onTransitionEnd = (e) => {
        if (e.target !== listRef.current) return;
        if (!shouldLoop || baseLen === 0 || stepPxRef.current === 0) return;

        const currentIdx = indexRef.current;
        if (currentIdx < baseLen * 2 || currentIdx >= baseLen * 3) {
            const wrappedIdx = (((currentIdx % baseLen) + baseLen) % baseLen) + baseLen * 2;
            indexRef.current = wrappedIdx;
            applyTransform(wrappedIdx * stepPxRef.current, false);
        }
    };

    const onTouchStart = (e) => {
        if (!shouldLoop) return;
        setPaused(true);
        normalizePosition();
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
        isDragging.current = false;
    };

    const onTouchMove = (e) => {
        if (!shouldLoop || touchStartX.current === null) return;
        const dx = e.touches[0].clientX - touchStartX.current;
        const dy = e.touches[0].clientY - (touchStartY.current || 0);

        if (!isDragging.current && Math.abs(dy) > Math.abs(dx)) {
            touchStartX.current = null;
            return;
        }

        if (Math.abs(dx) > 5) {
            isDragging.current = true;
            applyTransform(indexRef.current * stepPxRef.current + dx, false);
        }
    };

    const onTouchEnd = (e) => {
        if (!shouldLoop) return;
        setPaused(false);
        if (touchStartX.current === null) return;

        const dx = e.changedTouches[0].clientX - touchStartX.current;
        touchStartX.current = null;
        touchStartY.current = null;
        isDragging.current = false;

        if (Math.abs(dx) < 35) {
            applyTransform(indexRef.current * stepPxRef.current, true);
            return;
        }

        if (dx > 0) {
            goNext();
        } else {
            goPrev();
        }
    };

    if (!hasTeachers) return null;

    const controlClass =
        'flex h-12 w-12 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-sm transition-all duration-300 hover:scale-105 hover:border-primary hover:bg-primary hover:text-primary-foreground active:scale-95 dark:border-white/15 dark:hover:border-primary';

    return (
        <section id="teachers" className="relative py-20 overflow-hidden scroll-mt-20 bg-background sm:py-28">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -end-32 top-20 h-96 w-96 rounded-full bg-secondary/10 blur-[130px]"
            />

            <div className="relative px-5 mx-auto max-w-7xl sm:px-8">
                <div className="flex flex-col items-center text-center">
                    <SectionTitle align="center" {...heading} />

                    {shouldLoop && (
                        <Reveal className="items-center justify-center hidden gap-3 mt-7 sm:flex">
                            <button
                                type="button"
                                aria-label={t('teachers_prev')}
                                onClick={goPrev}
                                onMouseEnter={() => setPaused(true)}
                                onMouseLeave={() => setPaused(false)}
                                className={controlClass}
                            >
                                <ChevronRight size={22} />
                            </button>
                            <button
                                type="button"
                                aria-label={t('teachers_next')}
                                onClick={goNext}
                                onMouseEnter={() => setPaused(true)}
                                onMouseLeave={() => setPaused(false)}
                                className={controlClass}
                            >
                                <ChevronLeft size={22} />
                            </button>
                        </Reveal>
                    )}
                </div>

                <Reveal delay={0.15} className="mt-10 sm:mt-12">
                    <div
                        className="px-2 py-4 -mx-2 overflow-hidden select-none touch-pan-y"
                        onMouseEnter={() => setPaused(true)}
                        onMouseLeave={() => setPaused(false)}
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                    >
                        <ul
                            ref={listRef}
                            onTransitionEnd={onTransitionEnd}
                            className="flex gap-6 will-change-transform"
                        >
                            {displayItems.map((teacher, idx) => (
                                <li
                                    key={`${teacher._id}-${idx}`}
                                    className="w-full shrink-0 sm:w-[calc((100%-24px)/2)] lg:w-[calc((100%-72px)/4)]"
                                >
                                    <div className="h-full transition-transform duration-500 hover:-translate-y-1.5">
                                        <TeacherCard teacher={teacher} />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </Reveal>

                <Reveal delay={0.1} className="flex justify-center mt-12">
                    <Button href="/teachers" variant="outline" size="lg" className="group">
تعرف على كل المعلمين
                        <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
                    </Button>
                </Reveal>
            </div>
        </section>
    );
}