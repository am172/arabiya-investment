'use client';

import { useRef } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import Counter from '@/components/ui/Counter';
import Icon from '@/components/ui/Icon';
import HeroActions from './HeroActions';
import HeroEyebrow from './HeroEyebrow';
import HeroTitle from './HeroTitle';
import { EASE, container, item } from './shared';
import { optimizeImage } from '@/lib/utils/image';

const BLOBS = [
    { cls: '-start-32 -top-24 h-[34rem] w-[34rem] bg-primary/40', x: [0, 80, -40, 0], y: [0, 60, 20, 0], d: 22 },
    { cls: '-end-32 top-1/4 h-[30rem] w-[30rem] bg-accent/35', x: [0, -70, 30, 0], y: [0, -40, 50, 0], d: 26 },
    { cls: 'bottom-0 start-1/3 h-[26rem] w-[26rem] bg-secondary/30', x: [0, 60, -60, 0], y: [0, -60, 0, 0], d: 30 }
];

const CHIP_SLOTS = [
    { cls: 'start-[2%] top-[14%]', depth: 18 },
    { cls: 'end-[2%] top-[24%]', depth: -24 },
    { cls: 'start-[8%] bottom-[26%]', depth: 30 },
    { cls: 'end-[8%] bottom-[18%]', depth: -16 },
    { cls: 'start-[34%] top-0', depth: 22 },
    { cls: 'end-[34%] bottom-[8%]', depth: -28 }
];

const STAT_COLUMNS = {
    1: 'sm:grid-cols-1',
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-4'
};

function Blob({ blob, reduced }) {
    return (
        <motion.div
            animate={reduced ? undefined : { x: blob.x, y: blob.y, scale: [1, 1.15, 0.95, 1] }}
            transition={{ duration: blob.d, repeat: Infinity, ease: 'easeInOut' }}
            className={`absolute rounded-full blur-[110px] will-change-transform ${blob.cls}`}
        />
    );
}

function Pill({ badge }) {
    return (
        <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold border rounded-full border-border bg-surface/70 backdrop-blur-md sm:text-base">
            <Icon name={badge.icon} size={16} className="text-primary" />
            {badge.text}
        </span>
    );
}

function Chip({ badge, slot, index, sx, sy, reduced }) {
    const x = useTransform(sx, [-0.5, 0.5], [slot.depth, -slot.depth]);
    const y = useTransform(sy, [-0.5, 0.5], [slot.depth / 2, -slot.depth / 2]);

    return (
        <motion.li
            style={reduced ? undefined : { x, y }}
            className={`absolute z-10 hidden md:block ${slot.cls}`}
        >
            <motion.span
                animate={reduced ? undefined : { y: [0, -8, 0] }}
                transition={{ duration: 5 + index * 0.5, repeat: Infinity, ease: 'easeInOut' }}
                className="inline-flex items-center gap-2.5 rounded-2xl border border-white/30 bg-surface/60 px-4 py-2.5 text-sm font-semibold shadow-xl shadow-primary/10 backdrop-blur-xl dark:border-white/10 sm:text-base"
            >
                <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                    <Icon name={badge.icon} size={16} />
                </span>
                {badge.text}
            </motion.span>
        </motion.li>
    );
}

export default function HeroAurora({ hero, stats }) {
    const ref = useRef(null);
    const reduced = Boolean(useReducedMotion());
    const image = hero.image && hero.image.url ? optimizeImage(hero.image.url) : '';
    const badges = hero.badges.slice(0, 6);
    const shownStats = (stats || []).slice(0, 4);

    const px = useMotionValue(0);
    const py = useMotionValue(0);
    const sx = useSpring(px, { stiffness: 60, damping: 18 });
    const sy = useSpring(py, { stiffness: 60, damping: 18 });
    const imageX = useTransform(sx, [-0.5, 0.5], [18, -18]);
    const imageY = useTransform(sy, [-0.5, 0.5], [10, -10]);

    const handleMove = (event) => {
        if (reduced || event.pointerType === 'touch' || !ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        px.set((event.clientX - rect.left) / rect.width - 0.5);
        py.set((event.clientY - rect.top) / rect.height - 0.5);
    };

    const handleLeave = () => {
        px.set(0);
        py.set(0);
    };

    return (
        <section
            id="home"
            ref={ref}
            onPointerMove={handleMove}
            onPointerLeave={handleLeave}
            className="relative pb-12 overflow-hidden isolate bg-background pt-28 sm:pb-16 sm:pt-36"
        >
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none -z-10">
                {BLOBS.map((blob, index) => (
                    <Blob key={index} blob={blob} reduced={reduced} />
                ))}
                <div className="absolute inset-0 bg-grid mask-fade opacity-40 dark:opacity-20" />
            </div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="flex flex-col items-center max-w-4xl px-5 mx-auto text-center sm:px-8"
            >
                <HeroEyebrow text={hero.eyebrow} />
                <HeroTitle
                    text={hero.title}
                    gradientLast
                    className="mt-6 text-4xl sm:text-6xl lg:text-7xl lg:leading-[1.3]"
                />
                {hero.description && (
                    <motion.p
                        variants={item}
                        className="max-w-2xl mt-6 text-base leading-8 text-muted sm:text-lg sm:leading-9"
                    >
                        {hero.description}
                    </motion.p>
                )}
                <HeroActions hero={hero} centered />

                {!image && badges.length > 0 && (
                    <motion.ul variants={item} className="mt-10 flex flex-wrap justify-center gap-2.5">
                        {badges.map((badge, index) => (
                            <li key={`${badge.text}-${index}`}>
                                <Pill badge={badge} />
                            </li>
                        ))}
                    </motion.ul>
                )}
            </motion.div>

            {image && (
                <div className="relative max-w-5xl px-5 mx-auto mt-10 sm:mt-14 sm:px-8">
                    {badges.length > 0 && (
                        <ul className="mb-6 flex flex-wrap justify-center gap-2.5 md:hidden">
                            {badges.map((badge, index) => (
                                <li key={`${badge.text}-${index}`}>
                                    <Pill badge={badge} />
                                </li>
                            ))}
                        </ul>
                    )}

                    <ul className="absolute inset-y-0 pointer-events-none inset-x-5 sm:inset-x-8">
                        {badges.map((badge, index) => (
                            <Chip
                                key={`${badge.text}-${index}`}
                                badge={badge}
                                slot={CHIP_SLOTS[index]}
                                index={index}
                                sx={sx}
                                sy={sy}
                                reduced={reduced}
                            />
                        ))}
                    </ul>

                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.4, ease: EASE }}
                        style={{
                            WebkitMaskImage: 'linear-gradient(to bottom, #000 70%, transparent)',
                            maskImage: 'linear-gradient(to bottom, #000 70%, transparent)'
                        }}
                    >
                        <motion.div
                            animate={reduced ? undefined : { y: [0, -12, 0] }}
                            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1.4 }}
                        >
                            <motion.img
                                src={image}
                                alt=""
                                decoding="async"
                                style={reduced ? undefined : { x: imageX, y: imageY }}
                                className="mx-auto h-[260px] w-full object-contain will-change-transform sm:h-[360px] lg:h-[480px]"
                            />
                        </motion.div>
                    </motion.div>
                </div>
            )}

            {shownStats.length > 0 && (
                <div
                    className={`relative z-10 mx-auto max-w-5xl px-5 sm:px-8 ${image ? '-mt-6 sm:-mt-10' : 'mt-14'
                        }`}
                >
                    <motion.ul
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{ duration: 0.8, ease: EASE }}
                        className={`grid grid-cols-2 gap-px overflow-hidden rounded-theme border border-border bg-border shadow-2xl shadow-primary/10 ${STAT_COLUMNS[shownStats.length]
                            }`}
                    >
                        {shownStats.map((stat) => (
                            <li
                                key={stat._id}
                                className="px-4 py-6 text-center bg-surface/90 backdrop-blur-xl last:odd:col-span-2 sm:last:odd:col-span-1"
                            >
                                <p className="text-3xl font-extrabold font-heading text-primary sm:text-4xl">
                                    <Counter value={stat.value} prefix={stat.prefix || ''} suffix={stat.suffix || ''} />
                                </p>
                                <p className="mt-1.5 text-sm font-semibold text-muted sm:text-base">{stat.label}</p>
                            </li>
                        ))}
                    </motion.ul>
                </div>
            )}
        </section>
    );
}