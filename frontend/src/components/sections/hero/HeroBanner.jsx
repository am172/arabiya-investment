'use client';

import { motion } from 'framer-motion';
import HeroActions from './HeroActions';
import HeroEyebrow from './HeroEyebrow';
import HeroTitle from './HeroTitle';
import { container, item } from './shared';
import { optimizeImage } from '@/lib/utils/image';

export default function HeroBanner({ hero }) {
    const image =
        hero.bannerImage && hero.bannerImage.url ? optimizeImage(hero.bannerImage.url, 2000) : '';
    const overlay = Math.min(90, Math.max(0, Number(hero.bannerOverlay) || 0)) / 100;

    return (
        <section
            id="home"
            className="relative isolate mt-20 flex min-h-[78svh] items-center overflow-hidden bg-primary lg:mt-28 lg:min-h-[82svh]"
        >
            {image ? (
                <img
                    src={image}
                    alt=""
                    decoding="async"
                    className="absolute inset-0 object-cover w-full h-full -z-20"
                />
            ) : (
                <div className="absolute inset-0 -z-20 bg-gradient-to-br from-primary via-primary to-accent" />
            )}
            <div
                aria-hidden="true"
                className="absolute inset-0 bg-black -z-10"
                style={{ opacity: image ? overlay : 0.15 }}
            />
            <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 bg-gradient-to-t from-black/40 via-transparent to-transparent"
            />

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="flex flex-col items-center w-full max-w-4xl px-5 py-16 mx-auto text-center sm:px-8 lg:py-24"
            >
                <HeroEyebrow text={hero.eyebrow} onImage />
                <HeroTitle
                    text={hero.title}
                    className="mt-6 text-4xl text-white sm:text-5xl lg:text-6xl lg:leading-[1.35]"
                />
                <motion.p
                    variants={item}
                    className="max-w-2xl mt-6 text-base leading-8 text-white/85 sm:text-lg sm:leading-9"
                >
                    {hero.description}
                </motion.p>
                <HeroActions hero={hero} onImage centered />
            </motion.div>
        </section>
    );
}