'use client';

import { motion } from 'framer-motion';
import Counter from '@/components/ui/Counter';
import Icon from '@/components/ui/Icon';
import HeroActions from './HeroActions';
import HeroEyebrow from './HeroEyebrow';
import HeroTitle from './HeroTitle';
import { container, item } from './shared';

const STAT_COLUMNS = {
    1: 'lg:grid-cols-1',
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4'
};

export default function HeroFeatures({ hero, stats }) {
    const badges = hero.badges.slice(0, 6);
    const shownStats = (stats || []).slice(0, 4);
    const hasBadges = badges.length > 0;

    return (
        <section
            id="home"
            className="relative overflow-hidden isolate bg-background pb-14 pt-28 sm:pb-20 sm:pt-32"
        >
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none -z-10">
                <div className="absolute inset-0 opacity-50 bg-grid mask-fade dark:opacity-25" />
                <div className="absolute -start-24 top-10 h-96 w-96 rounded-full bg-primary/15 blur-[130px]" />
                <div className="absolute -end-24 bottom-0 h-96 w-96 rounded-full bg-accent/15 blur-[130px]" />
            </div>

            <div className="px-5 mx-auto max-w-7xl sm:px-8">
                <div
                    className={`grid items-center gap-12 ${hasBadges ? 'lg:grid-cols-[1.15fr_1fr] lg:gap-16' : ''}`}
                >
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className={`flex flex-col ${hasBadges ? 'items-start text-start' : 'mx-auto max-w-3xl items-center text-center'
                            }`}
                    >
                        <HeroEyebrow text={hero.eyebrow} />
                        <HeroTitle
                            text={hero.title}
                            className="mt-6 text-4xl sm:text-5xl lg:text-6xl lg:leading-[1.35]"
                        />
                        <motion.p
                            variants={item}
                            className="max-w-xl mt-6 text-base leading-8 text-muted sm:text-lg sm:leading-9"
                        >
                            {hero.description}
                        </motion.p>
                        <HeroActions hero={hero} centered={!hasBadges} />
                    </motion.div>

                    {hasBadges && (
                        <motion.ul
                            variants={container}
                            initial="hidden"
                            animate="show"
                            className="grid grid-cols-2 gap-4"
                        >
                            {badges.map((badge, index) => (
                                <motion.li
                                    key={`${badge.text}-${index}`}
                                    variants={item}
                                    className={index % 2 === 1 ? 'sm:mt-8' : ''}
                                >
                                    <div className="flex flex-col h-full gap-4 p-5 transition duration-300 border shadow-sm rounded-theme border-border bg-surface shadow-primary/5 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 sm:p-6">
                                        <span className="flex items-center justify-center w-12 h-12 shadow-lg rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-primary/30">
                                            <Icon name={badge.icon} />
                                        </span>
                                        <span className="text-base font-bold leading-7 sm:text-lg">{badge.text}</span>
                                    </div>
                                </motion.li>
                            ))}
                        </motion.ul>
                    )}
                </div>

                {shownStats.length > 0 && (
                    <motion.ul
                        initial={{ opacity: 0, y: 32 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className={`mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-theme border border-border bg-border ${STAT_COLUMNS[shownStats.length]
                            }`}
                    >
                        {shownStats.map((stat) => (
                            <li
                                key={stat._id}
                                className="px-5 text-center bg-surface py-7 last:odd:col-span-2 lg:last:odd:col-span-1"
                            >
                                <p className="text-3xl font-extrabold font-heading text-primary sm:text-4xl">
                                    <Counter value={stat.value} prefix={stat.prefix || ''} suffix={stat.suffix || ''} />
                                </p>
                                <p className="mt-2 text-sm font-semibold text-muted sm:text-base">{stat.label}</p>
                            </li>
                        ))}
                    </motion.ul>
                )}
            </div>
        </section>
    );
}