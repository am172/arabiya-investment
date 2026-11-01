'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, Sparkles, Video } from 'lucide-react';
import Button from '@/components/ui/Button';
import TiltCard from '@/components/ui/TiltCard';
import { useCurrency } from '@/components/providers/CurrencyProvider';
import { useT } from '@/components/providers/TextsProvider';
import { useContactStore } from '@/store/useContactStore';
import { formatMoney } from '@/lib/utils/currency';

const PRIMARY = 'rgb(var(--primary))';
const SECONDARY = 'rgb(var(--secondary))';
const ACCENT = 'rgb(var(--accent))';
const FOREGROUND = 'rgb(var(--foreground))';

const CONIC_MAIN = `conic-gradient(from 0deg, ${SECONDARY}, ${ACCENT}, ${SECONDARY}, ${PRIMARY}, ${SECONDARY})`;
const CONIC_GLOW = `conic-gradient(from 90deg, transparent 0%, color-mix(in srgb, ${ACCENT} 80%, transparent) 20%, transparent 42%, color-mix(in srgb, ${PRIMARY} 70%, transparent) 62%, transparent 82%)`;
const CENTER_SPOT = `radial-gradient(circle at 50% 50%, color-mix(in srgb, ${ACCENT} 55%, transparent), transparent 55%)`;
const LIGHT_OVERLAY = `color-mix(in srgb, ${FOREGROUND} 72%, transparent)`;

const isContactLink = (link) =>
    !link || link === '/contact' || link === '#contact' || link === '/#contact';

const centerSlide = (track, slide, behavior) => {
    const trackRect = track.getBoundingClientRect();
    const slideRect = slide.getBoundingClientRect();
    track.scrollBy({
        left: slideRect.left + slideRect.width / 2 - (trackRect.left + trackRect.width / 2),
        behavior,
    });
};

export function PackagesSlider({ packages }) {
    const trackRef = useRef(null);
    const indexRef = useRef(0);
    const pausedUntil = useRef(0);
    const [active, setActive] = useState(0);

    useEffect(() => {
        const track = trackRef.current;
        if (!track) return undefined;
        const slides = Array.from(track.children);
        if (slides.length < 2) return undefined;

        const start = Math.max(
            0,
            packages.findIndex((pkg) => pkg.isPopular)
        );
        indexRef.current = start;
        setActive(start);
        centerSlide(track, slides[start], 'auto');

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    const index = slides.indexOf(entry.target);
                    if (index < 0) return;
                    indexRef.current = index;
                    setActive(index);
                });
            },
            { root: track, threshold: 0.6 }
        );
        slides.forEach((slide) => observer.observe(slide));

        const timer = setInterval(() => {
            if (Date.now() < pausedUntil.current) return;
            const next = (indexRef.current + 1) % slides.length;
            centerSlide(track, slides[next], 'smooth');
        }, 3500);

        return () => {
            clearInterval(timer);
            observer.disconnect();
        };
    }, [packages]);

    const pause = () => {
        pausedUntil.current = Date.now() + 6000;
    };

    const goTo = (index) => {
        const track = trackRef.current;
        if (!track) return;
        pause();
        centerSlide(track, track.children[index], 'smooth');
    };

    return (
        <div>
            <div
                ref={trackRef}
                onPointerDown={pause}
                onTouchStart={pause}
                onWheel={pause}
                className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-[8%] py-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {packages.map((pkg) => (
                    <div key={pkg._id} className="w-[84%] shrink-0 snap-center">
                        <PackageCard pkg={pkg} />
                    </div>
                ))}
            </div>

            {packages.length > 1 && (
                <div className="flex items-center justify-center gap-2 mt-2">
                    {packages.map((pkg, index) => (
                        <button
                            key={pkg._id}
                            type="button"
                            aria-label={pkg.name}
                            onClick={() => goTo(index)}
                            className={`h-2 rounded-full transition-all duration-300 ${active === index ? 'w-6 bg-primary' : 'w-2 bg-border'
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function PackageCard({ pkg: pkgProp, item, packageItem, data }) {
    const pkg = pkgProp || item || packageItem || data;
    const t = useT();
    const { priceFor } = useCurrency();
    const setSelectedPackage = useContactStore((state) => state.setSelectedPackage);

    if (!pkg) return null;

    const popular = Boolean(pkg.isPopular);
    const { price, discountPrice, currency } = priceFor(pkg);
    const hasDiscount = discountPrice !== null && discountPrice !== undefined && discountPrice < price;
    const current = hasDiscount ? discountPrice : price;
    const percentOff = hasDiscount ? Math.round((1 - discountPrice / price) * 100) : 0;
    const period = t(`packages_period_${String(pkg.billingPeriod).replace('-', '')}`);
    const toContact = isContactLink(pkg.ctaLink);
    const badge = pkg.badge || (popular ? t('packages_popular') : '');

    return (
        <TiltCard className="h-full rounded-theme" max={popular ? 7 : 4} scale={popular ? 1.03 : 1.015}>
            <div className="relative h-full">
                {popular && (
                    <div
                        aria-hidden="true"
                        className="absolute -inset-3 rounded-theme bg-gradient-to-r from-secondary/40 via-accent/30 to-primary/40 opacity-70 blur-2xl"
                    />
                )}

                <div
                    className={`relative h-full overflow-hidden rounded-theme border ${popular ? 'border-secondary/50 shadow-2xl shadow-secondary/25' : 'border-border'
                        }`}
                >
                    {popular && (
                        <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
                            <div className="absolute inset-0 bg-surface" />
                            <div className="absolute left-1/2 top-1/2 aspect-square w-[260%] -translate-x-1/2 -translate-y-1/2">
                                <div
                                    className="w-full h-full animate-[spin_10s_linear_infinite]"
                                    style={{ background: CONIC_MAIN }}
                                />
                            </div>
                            <div className="absolute left-1/2 top-1/2 aspect-square w-[260%] -translate-x-1/2 -translate-y-1/2">
                                <div
                                    className="w-full h-full animate-[spin_16s_linear_infinite_reverse]"
                                    style={{ background: CONIC_GLOW }}
                                />
                            </div>
                            <div className="absolute inset-0" style={{ background: CENTER_SPOT }} />
                            <div className="absolute inset-0 dark:hidden" style={{ background: LIGHT_OVERLAY }} />
                            <div className="absolute inset-0 hidden bg-surface/70 dark:block" />
                        </div>
                    )}

                    <div
                        className={`relative flex h-full flex-col p-7 sm:p-8 ${popular
                            ? 'rounded-theme text-background dark:text-foreground'
                            : 'rounded-[calc(var(--radius)-2px)] bg-surface'
                            }`}
                    >
                        {badge && (
                            <span
                                className={`mb-5 inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${popular
                                    ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/30'
                                    : 'bg-secondary/15 text-secondary'
                                    }`}
                            >
                                {popular && <Sparkles size={12} />}
                                {badge}
                            </span>
                        )}

                        <h3 className="text-2xl font-bold">{pkg.name}</h3>
                        {pkg.description && (
                            <p
                                className={`mt-2 text-sm leading-relaxed ${popular ? 'text-background/80 dark:text-muted' : 'text-muted'
                                    }`}
                            >
                                {pkg.description}
                            </p>
                        )}

                        <motion.div
                            key={currency}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="flex flex-wrap items-end mt-6 gap-x-2 gap-y-1">
                                <span className="text-4xl font-extrabold tracking-tight font-heading sm:text-5xl">
                                    {formatMoney(current, currency)}
                                </span>
                                {period && (
                                    <span
                                        className={`pb-1.5 text-sm font-medium ${popular ? 'text-background/75 dark:text-muted' : 'text-muted'
                                            }`}
                                    >
                                        {period}
                                    </span>
                                )}
                            </div>

                            {hasDiscount && (
                                <div className="flex items-center gap-2 mt-2 text-sm">
                                    <span
                                        className={`line-through ${popular ? 'text-background/65 dark:text-muted' : 'text-muted'
                                            }`}
                                    >
                                        {formatMoney(price, currency)}
                                    </span>
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-xs font-bold ${popular
                                            ? 'bg-background/20 text-background dark:bg-success/15 dark:text-success'
                                            : 'bg-success/15 text-success'
                                            }`}
                                    >
                                        {t('packages_save', { n: percentOff })}
                                    </span>
                                </div>
                            )}
                        </motion.div>

                        {(pkg.sessionsPerMonth > 0 || pkg.sessionDuration > 0) && (
                            <div className="flex flex-wrap gap-2 mt-6 text-xs font-medium">
                                {pkg.sessionsPerMonth > 0 && (
                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 dark:border dark:border-primary/40 dark:text-foreground ${popular
                                            ? 'bg-background/15 text-background dark:bg-surface/90'
                                            : 'bg-primary/10 text-primary dark:bg-surface/90'
                                            }`}
                                    >
                                        <Video size={13} className="dark:text-primary" />
                                        {t('packages_sessions', { n: pkg.sessionsPerMonth })}
                                    </span>
                                )}
                                {pkg.sessionDuration > 0 && (
                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 ${popular
                                            ? 'bg-background/15 text-background dark:bg-accent/10 dark:text-accent'
                                            : 'bg-accent/10 text-accent'
                                            }`}
                                    >
                                        <Clock size={13} />
                                        {t('packages_minutes', { n: pkg.sessionDuration })}
                                    </span>
                                )}
                            </div>
                        )}

                        <ul
                            className={`mt-7 flex-1 space-y-3.5 border-t pt-7 ${popular ? 'border-background/25 dark:border-border' : 'border-border'
                                }`}
                        >
                            {(pkg.features || []).map((feature) => (
                                <li key={feature} className="flex items-start gap-3 text-sm">
                                    <span
                                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${popular
                                            ? 'bg-background/20 text-background dark:bg-success/15 dark:text-success'
                                            : 'bg-success/15 text-success'
                                            }`}
                                    >
                                        <Check size={12} strokeWidth={3} />
                                    </span>
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <Button
                            href={toContact ? '/#contact' : pkg.ctaLink}
                            variant={popular ? 'primary' : 'outline'}
                            size="lg"
                            className="w-full mt-8 border-2 !border-accent"
                            data-track={`package:${pkg.name}`}
                            onClick={toContact ? () => setSelectedPackage(pkg.name) : undefined}
                        >
                            {pkg.ctaLabel || t('packages_cta')}
                        </Button>
                    </div>
                </div>
            </div>
        </TiltCard>
    );
}