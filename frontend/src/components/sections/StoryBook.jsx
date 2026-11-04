'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const arNum = (n) => n.toLocaleString('ar-EG');

const ruledStyle = {
    backgroundImage:
        'repeating-linear-gradient(to bottom, transparent 0, transparent calc(var(--lh) - 1px), var(--rule) calc(var(--lh) - 1px), var(--rule) var(--lh))',
    backgroundAttachment: 'local',
};

function pageStyle(index, active, total) {
    const offset = index - active;

    if (offset < 0) {
        return {
            transform: 'rotateX(172deg) translateY(-4%)',
            opacity: 0,
            zIndex: 100 + offset,
            pointerEvents: 'none',
        };
    }

    const tilt = offset === 0 ? 0 : (offset % 2 ? -1 : 1) * (1.2 + offset * 0.5);
    return {
        transform: `translateY(${offset * 14}px) scale(${1 - offset * 0.045}) rotate(${tilt}deg)`,
        opacity: offset > 3 ? 0 : 1,
        zIndex: total - index,
    };
}

function NavButton({ direction, onClick, disabled, className = '' }) {
    const isNext = direction === 'next';
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label={isNext ? 'الفقرة التالية' : 'الفقرة السابقة'}
            className={`group/btn z-30 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-800 shadow-lg shadow-zinc-900/10 outline-none transition-all duration-300 hover:border-primary hover:bg-primary hover:text-white focus-visible:ring-2 focus-visible:ring-primary active:scale-90 disabled:pointer-events-none disabled:opacity-35 dark:border-white/15 dark:bg-background dark:text-zinc-100 dark:hover:border-amber-400 dark:hover:bg-amber-400 dark:hover:text-zinc-900 dark:focus-visible:ring-amber-300 sm:h-12 sm:w-12 ${className}`}
        >
            <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className={`h-5 w-5 fill-none stroke-current transition-transform duration-300 ${
                    isNext ? 'group-hover/btn:-translate-x-0.5' : 'group-hover/btn:translate-x-0.5'
                }`}
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d={isNext ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'} />
            </svg>
        </button>
    );
}

export default function StoryBook({ header, paragraphs = [] }) {
    const total = paragraphs.length;
    const bookRef = useRef(null);
    const touchX = useRef(null);
    const [active, setActive] = useState(0);
    const [seen, setSeen] = useState(false);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        const node = bookRef.current;
        if (!node) return undefined;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;
                setSeen(true);
                observer.disconnect();
            },
            { threshold: 0.3 }
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!seen || paused || total <= 1) return undefined;

        const timer = setInterval(() => {
            setActive((prev) => (prev + 1) % total);
        }, 3000);

        return () => clearInterval(timer);
    }, [seen, paused, total, active]);

    const goTo = useCallback((index) => setActive(Math.min(total - 1, Math.max(0, index))), [total]);

    const onKeyDown = (event) => {
        if (event.key === 'ArrowLeft') goTo(active + 1);
        if (event.key === 'ArrowRight') goTo(active - 1);
    };

    const onTouchStart = (event) => {
        setPaused(true);
        touchX.current = event.touches[0].clientX;
    };

    const onTouchEnd = (event) => {
        setPaused(false);
        if (touchX.current === null) return;
        const dx = event.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) < 50) return;
        goTo(dx < 0 ? active + 1 : active - 1);
    };

    const hasNav = total > 1;

    return (
        <div className="relative">
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
                <div className="absolute -start-24 top-1/4 h-80 w-80 rounded-full bg-primary/15 blur-[120px] dark:bg-primary/10" />
                <div className="absolute -end-24 bottom-0 h-72 w-72 rounded-full bg-amber-400/15 blur-[120px] dark:bg-amber-300/10" />
            </div>

            <div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-5 sm:px-8 lg:grid lg:grid-cols-[3fr_7fr] lg:items-center lg:gap-14">
                <div className="pt-8 lg:-translate-y-14 lg:pt-0">{header}</div>

                <div
                    className="flex flex-col items-center w-full min-w-0 gap-5"
                    onMouseEnter={() => setPaused(true)}
                    onMouseLeave={() => setPaused(false)}
                    onFocusCapture={() => setPaused(true)}
                    onBlurCapture={(e) => {
                        if (!e.currentTarget.contains(e.relatedTarget)) {
                            setPaused(false);
                        }
                    }}
                >
                    <div className="flex items-center justify-center w-full gap-3 lg:gap-6">
                        {hasNav && (
                            <NavButton
                                direction="prev"
                                onClick={() => goTo(active - 1)}
                                disabled={active === 0}
                                className="hidden sm:flex"
                            />
                        )}

                        <div
                            ref={bookRef}
                            tabIndex={0}
                            role="group"
                            aria-label="دفتر قصتنا"
                            onKeyDown={onKeyDown}
                            onTouchStart={onTouchStart}
                            onTouchEnd={onTouchEnd}
                            className={`relative h-[26rem] w-full max-w-xl min-w-0 outline-none transition-all duration-1000 ease-out [perspective:1600px] motion-reduce:transition-none sm:h-[28rem] lg:h-[30rem] ${
                                seen ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
                            }`}
                        >
                            <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
                                <div className="absolute inset-x-5 top-8 bottom-3 rotate-[3deg] rounded-3xl bg-gradient-to-br from-primary/40 via-primary/20 to-amber-400/30 dark:from-amber-400/25 dark:via-amber-400/10 dark:to-zinc-100/10 sm:bottom-4" />
                                <div className="absolute w-20 h-20 border-2 border-dashed rounded-full -top-2 -end-3 border-primary/40 dark:border-amber-300/40" />
                                <div
                                    className="absolute w-24 h-16 -bottom-1 -start-3 text-primary opacity-40 dark:text-amber-300"
                                    style={{
                                        backgroundImage: 'radial-gradient(currentColor 1.5px, transparent 1.5px)',
                                        backgroundSize: '12px 12px',
                                    }}
                                />
                                <div className="absolute w-5 h-5 rotate-45 rounded-md top-1/2 -start-2 bg-amber-400/70" />
                            </div>

                            <div className="absolute inset-x-0 top-3 bottom-6 sm:bottom-8 [transform-style:preserve-3d]">
                                {paragraphs.map((text, index) => {
                                    const offset = index - active;
                                    return (
                                        <article
                                            key={`${index}-${text.slice(0, 12)}`}
                                            aria-hidden={offset !== 0}
                                            style={{
                                                ...pageStyle(index, active, total),
                                                transformOrigin: 'top center',
                                                backfaceVisibility: 'hidden',
                                            }}
                                            className="absolute inset-0 flex flex-col overflow-hidden rounded-2xl border border-amber-900/10 bg-[#fffdf7] shadow-2xl shadow-zinc-900/20 transition-[transform,opacity] duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none dark:border-white/15 dark:bg-background dark:shadow-black/40 [--lh:2.5rem] [--rule:rgba(96,165,250,0.22)] dark:[--rule:rgba(255,255,255,0.07)] sm:[--lh:3.25rem]"
                                        >
                                            <div
                                                aria-hidden="true"
                                                className="absolute inset-0 text-zinc-900 opacity-[0.07] dark:text-white dark:opacity-[0.06]"
                                                style={{
                                                    backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
                                                    backgroundSize: '18px 18px',
                                                }}
                                            />
                                            <div
                                                aria-hidden="true"
                                                className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/20 to-transparent dark:from-primary/15"
                                            />
                                            <div
                                                aria-hidden="true"
                                                className="absolute w-32 h-32 rounded-full -bottom-10 -start-10 bg-amber-400/20 blur-2xl dark:bg-amber-300/10"
                                            />

                                            <div
                                                aria-hidden="true"
                                                className="absolute top-0 z-10 flex h-14 w-8 items-start justify-center bg-primary pt-3.5 text-white shadow-md end-5 [clip-path:polygon(0_0,100%_0,100%_100%,50%_78%,0_100%)] dark:bg-amber-400 dark:text-zinc-900 sm:end-8 sm:h-16 sm:w-9"
                                            >
                                                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                                                    <path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4z" />
                                                </svg>
                                            </div>

                                            <div aria-hidden="true" className="relative flex justify-center gap-3 pt-2.5 sm:gap-4">
                                                {Array.from({ length: 9 }).map((_, i) => (
                                                    <span
                                                        key={i}
                                                        className="h-3.5 w-1.5 rounded-full bg-gradient-to-b from-zinc-300 to-zinc-500 shadow-sm ring-1 ring-black/10 dark:from-zinc-200 dark:to-zinc-500 dark:ring-white/10"
                                                    />
                                                ))}
                                            </div>

                                            <div className="relative flex flex-col flex-1 min-h-0 px-6 pt-5 pb-4 sm:px-10 sm:pt-7">
                                                <svg
                                                    aria-hidden="true"
                                                    viewBox="0 0 32 32"
                                                    className="mb-2 w-7 h-7 shrink-0 text-primary/50 dark:text-amber-300/70"
                                                    fill="currentColor"
                                                >
                                                    <path d="M4 18c0-6 3-11 9-13l1.5 2.5C11 9 9.5 11 9.3 13H14v11H4V18zm14 0c0-6 3-11 9-13l1.5 2.5C25 9 23.5 11 23.3 13H28v11H18V18z" />
                                                </svg>

                                                <div
                                                    style={ruledStyle}
                                                    className="-mx-6 min-h-0 flex-1 overflow-y-auto px-6 sm:-mx-10 sm:px-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                                                >
                                                    <p
                                                        style={{ lineHeight: 'var(--lh)' }}
                                                        className="font-[family-name:var(--font-hand)] text-lg font-medium text-slate-800 dark:text-zinc-200 sm:text-2xl"
                                                    >
                                                        {text}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-3 mt-3 text-xs shrink-0 text-zinc-500 dark:text-zinc-400 sm:text-sm">
                                                    <span className="flex-1 h-px bg-zinc-300 dark:bg-white/10" />
                                                    <span className="tabular-nums">
                                                        {arNum(index + 1)} / {arNum(total)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div
                                                aria-hidden="true"
                                                style={{ opacity: Math.min(0.7, Math.max(0, offset) * 0.28) }}
                                                className="absolute inset-0 transition-opacity duration-700 pointer-events-none bg-zinc-300 dark:hidden"
                                            />
                                        </article>
                                    );
                                })}
                            </div>
                        </div>

                        {hasNav && (
                            <NavButton
                                direction="next"
                                onClick={() => goTo(active + 1)}
                                disabled={active === total - 1}
                                className="hidden sm:flex"
                            />
                        )}
                    </div>

                    {hasNav && (
                        <div className="flex items-center justify-center gap-2">
                            <NavButton
                                direction="prev"
                                onClick={() => goTo(active - 1)}
                                disabled={active === 0}
                                className="!h-10 !w-10 sm:hidden"
                            />

                            <div role="tablist" aria-label="فقرات قصتنا" className="flex items-center justify-center gap-1">
                                {paragraphs.map((_, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        role="tab"
                                        aria-selected={i === active}
                                        aria-label={`الانتقال إلى الفقرة ${arNum(i + 1)}`}
                                        onClick={() => goTo(i)}
                                        className="p-1.5 outline-none group"
                                    >
                                        <span
                                            className={`block h-2 rounded-full transition-all duration-500 group-focus-visible:ring-2 group-focus-visible:ring-primary dark:group-focus-visible:ring-amber-300 ${
                                                i === active
                                                    ? 'w-8 bg-primary dark:bg-amber-400'
                                                    : 'w-2 bg-zinc-300 group-hover:bg-zinc-400 dark:bg-zinc-600 dark:group-hover:bg-zinc-500'
                                            }`}
                                        />
                                    </button>
                                ))}
                            </div>

                            <NavButton
                                direction="next"
                                onClick={() => goTo(active + 1)}
                                disabled={active === total - 1}
                                className="!h-10 !w-10 sm:hidden"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}