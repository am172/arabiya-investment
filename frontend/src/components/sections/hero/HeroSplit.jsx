'use client';

import { motion, useReducedMotion } from 'framer-motion';
import HeroActions from './HeroActions';
import HeroEyebrow from './HeroEyebrow';
import HeroTitle from './HeroTitle';
import { EASE, container, item } from './shared';
import { optimizeImage } from '@/lib/utils/image';

export default function HeroSplit({ hero }) {
  const reduced = useReducedMotion();
  const image = hero.image && hero.image.url ? optimizeImage(hero.image.url) : '';
  const split = Boolean(image);

  return (
    <section
      id="home"
      className={`relative isolate flex items-center overflow-hidden bg-background ${
        split ? 'lg:min-h-[90svh]' : 'min-h-[70svh]'
      }`}
    >
      <div
        className={`mx-auto grid w-full max-w-7xl items-center gap-6 px-5 pb-8 pt-24 sm:gap-10 sm:px-8 sm:pb-12 sm:pt-28 lg:gap-12 lg:pb-16 lg:pt-32 ${
          split ? 'lg:grid-cols-2' : ''
        }`}
      >
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className={`flex flex-col ${
            split ? 'items-start text-start' : 'mx-auto max-w-3xl items-center text-center'
          }`}
        >
          <HeroEyebrow text={hero.eyebrow} />
          <HeroTitle
            text={hero.title}
            className="mt-5 text-3xl sm:mt-6 sm:text-5xl lg:text-6xl lg:leading-[1.35]"
          />
          {hero.description && (
            <motion.p
              variants={item}
              className={`mt-6 max-w-xl text-base leading-8 text-muted sm:text-lg sm:leading-9 ${
                split ? 'hidden sm:block' : ''
              }`}
            >
              {hero.description}
            </motion.p>
          )}
          <HeroActions hero={hero} centered={!split} />
        </motion.div>

        {split && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: EASE }}
            className="flex items-center justify-center"
          >
            <motion.img
              src={image}
              alt=""
              decoding="async"
              animate={reduced ? undefined : { y: [0, -14, 0] }}
              transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity, delay: 1.2 }}
              className="h-[34svh] min-h-[200px] w-full object-contain will-change-transform sm:h-[440px] lg:h-[600px]"
            />
          </motion.div>
        )}
      </div>
    </section>
  );
}