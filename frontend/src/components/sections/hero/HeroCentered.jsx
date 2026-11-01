'use client';

import { motion } from 'framer-motion';
import Icon from '@/components/ui/Icon';
import HeroActions from './HeroActions';
import HeroEyebrow from './HeroEyebrow';
import HeroTitle from './HeroTitle';
import { EASE, container, item } from './shared';
import { optimizeImage } from '@/lib/utils/image';

export default function HeroCentered({ hero }) {
  const image = hero.image && hero.image.url ? optimizeImage(hero.image.url) : '';
  const badges = hero.badges.slice(0, 6);

  return (
    <section
      id="home"
      className="relative pt-32 pb-16 overflow-hidden isolate bg-background sm:pb-24 sm:pt-40"
    >
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute start-1/4 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-primary/20 blur-[140px] rtl:translate-x-1/2" />
        <div className="absolute end-1/4 top-1/3 h-[26rem] w-[26rem] translate-x-1/2 rounded-full bg-accent/20 blur-[140px] rtl:-translate-x-1/2" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-secondary/15 blur-[120px]" />
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
          className="mt-7 text-4xl sm:text-6xl lg:text-7xl lg:leading-[1.3]"
        />
        <motion.p
          variants={item}
          className="max-w-2xl text-base leading-8 mt-7 text-muted sm:text-lg sm:leading-9"
        >
          {hero.description}
        </motion.p>
        <HeroActions hero={hero} centered />

        {badges.length > 0 && (
          <motion.ul
            variants={container}
            className="flex flex-wrap justify-center gap-3 mt-12"
          >
            {badges.map((badge, index) => (
              <motion.li key={`${badge.text}-${index}`} variants={item}>
                <motion.span
                  animate={{ y: [0, -6, 0] }}
                  transition={{
                    duration: 4 + index * 0.4,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold border rounded-full shadow-sm border-border bg-surface/70 shadow-primary/5 backdrop-blur-md sm:text-base"
                >
                  <Icon name={badge.icon} size={16} className="text-primary" />
                  {badge.text}
                </motion.span>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </motion.div>

      {image && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: EASE }}
          className="max-w-5xl px-5 mx-auto mt-14 sm:px-8"
        >
          <img
            src={image}
            alt=""
            decoding="async"
            className="mx-auto h-[280px] w-full object-contain sm:h-[380px] lg:h-[480px]"
          />
        </motion.div>
      )}
    </section>
  );
}