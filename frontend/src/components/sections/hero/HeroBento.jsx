'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Counter from '@/components/ui/Counter';
import Icon from '@/components/ui/Icon';
import TiltCard from '@/components/ui/TiltCard';
import HeroActions from './HeroActions';
import HeroEyebrow from './HeroEyebrow';
import HeroTitle from './HeroTitle';
import { container, item } from './shared';
import { optimizeImage } from '@/lib/utils/image';

const STRIP_COLUMNS = {
    1: '',
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4'
};

const buildTiles = (stats, badges) => {
    const statTiles = stats.slice(0, 2).map((stat) => ({ type: 'stat', key: `s-${stat._id}`, stat }));
    const badgeTiles = badges
        .slice(0, 4)
        .map((badge, index) => ({ type: 'badge', key: `b-${index}`, badge }));
    const tiles = [];
    const total = Math.max(statTiles.length, badgeTiles.length);

    for (let index = 0; index < total; index += 1) {
        if (badgeTiles[index]) tiles.push(badgeTiles[index]);
        if (statTiles[index]) tiles.push(statTiles[index]);
    }
    return tiles.slice(0, 4);
};

function Tile({ tile, filled }) {
    return (
        <TiltCard max={5} scale={1.02} className="h-full rounded-theme">
            <div
                className={`flex h-full min-h-[8.5rem] flex-col justify-between gap-5 rounded-theme border p-6 ${filled
                    ? 'border-transparent bg-primary text-primary-foreground shadow-xl shadow-primary/25'
                    : 'border-border bg-surface'
                    }`}
            >
                {tile.type === 'stat' ? (
                    <>
                        <p
                            className={`font-heading text-4xl font-extrabold sm:text-5xl ${filled ? '' : 'text-primary'
                                }`}
                        >
                            <Counter
                                value={tile.stat.value}
                                prefix={tile.stat.prefix || ''}
                                suffix={tile.stat.suffix || ''}
                            />
                        </p>
                        <p className={`text-sm font-semibold sm:text-base ${filled ? 'opacity-90' : 'text-muted'}`}>
                            {tile.stat.label}
                        </p>
                    </>
                ) : (
                    <>
                        <span
                            className={`flex h-12 w-12 items-center justify-center rounded-2xl ${filled
                                ? 'bg-white/20'
                                : 'bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg shadow-primary/30'
                                }`}
                        >
                            <Icon name={tile.badge.icon} />
                        </span>
                        <p className="text-base font-bold leading-7 sm:text-lg">{tile.badge.text}</p>
                    </>
                )}
            </div>
        </TiltCard>
    );
}

export default function HeroBento({ hero, stats }) {
    const reduced = useReducedMotion();
    const image = hero.image && hero.image.url ? optimizeImage(hero.image.url) : '';
    const tiles = buildTiles(stats || [], hero.badges);

    return (
        <section id="home" className="relative overflow-hidden isolate bg-background pb-14 pt-28 sm:pt-32">
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none -z-10">
                <div className="absolute -start-24 top-0 h-96 w-96 rounded-full bg-primary/10 blur-[130px]" />
                <div className="absolute -end-24 bottom-0 h-96 w-96 rounded-full bg-accent/10 blur-[130px]" />
            </div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid gap-4 px-5 mx-auto max-w-7xl sm:px-8 lg:grid-cols-12 lg:gap-5"
            >
                <motion.div
                    variants={item}
                    className={`relative overflow-hidden rounded-theme border border-border bg-surface p-7 sm:p-10 lg:p-12 ${image ? 'lg:col-span-7' : 'lg:col-span-12'
                        }`}
                >
                    <div
                        aria-hidden="true"
                        className="absolute rounded-full pointer-events-none -end-20 -top-20 h-72 w-72 bg-primary/15 blur-3xl"
                    />
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 pointer-events-none bg-grid mask-fade opacity-30 dark:opacity-15"
                    />
                    <div className="relative flex flex-col items-start justify-center h-full">
                        <HeroEyebrow text={hero.eyebrow} />
                        <HeroTitle
                            text={hero.title}
                            gradientLast
                            className="mt-6 text-4xl sm:text-5xl lg:text-6xl lg:leading-[1.35]"
                        />
                        {hero.description && (
                            <motion.p
                                variants={item}
                                className="max-w-xl mt-6 text-base leading-8 text-muted sm:text-lg sm:leading-9"
                            >
                                {hero.description}
                            </motion.p>
                        )}
                        <HeroActions hero={hero} />
                    </div>
                </motion.div>

                {image && (
                    <motion.div
                        variants={item}
                        className="relative min-h-[320px] overflow-hidden rounded-theme bg-gradient-to-br from-primary via-primary to-accent sm:min-h-[400px] lg:col-span-5 lg:min-h-[520px]"
                    >
                        <div
                            aria-hidden="true"
                            className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] [background-size:22px_22px]"
                        />
                        <motion.img
                            src={image}
                            alt=""
                            decoding="async"
                            animate={reduced ? undefined : { y: [0, -10, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
                            className="absolute inset-0 object-contain w-full h-full p-3 will-change-transform sm:p-4"
                        />
                    </motion.div>
                )}

                {tiles.length > 0 && (
                    <motion.ul
                        variants={container}
                        className={`grid gap-4 lg:col-span-12 lg:gap-5 ${STRIP_COLUMNS[tiles.length]}`}
                    >
                        {tiles.map((tile, index) => (
                            <motion.li key={tile.key} variants={item}>
                                <Tile tile={tile} filled={index === 0 || index === 3} />
                            </motion.li>
                        ))}
                    </motion.ul>
                )}
            </motion.div>
        </section>
    );
}