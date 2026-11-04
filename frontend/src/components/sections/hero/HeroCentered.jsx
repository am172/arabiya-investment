'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import HeroActions from './HeroActions';
import HeroTitle from './HeroTitle';
import { container, item } from './shared';
import { useT } from '@/components/providers/TextsProvider';
import { optimizeImage } from '@/lib/utils/image';

const BG_IMAGE = '/images/hero/hero-bg.png';
const BG_MOBILE_IMAGE = '/images/hero/hero-bg-mobile.png';
const LINES_IMAGE = '/images/hero/lines-bg.png';

const MOBILE_PHOTO_POSITION = '60% 50%';

const CONSIDER_NAVBAR = false;

const DESKTOP_PHOTO = CONSIDER_NAVBAR
  ? { box: 'left-[0.6%] top-[14.5%] h-[74%] w-[65%]', fit: 'object-contain object-left' }
  : { box: 'left-[0.6%] top-[1%] h-[93.3%] w-[70%]', fit: 'object-cover object-left-top' };

const LINE = {
  topX: 69.62,
  topY: 1.07,
  bottomX: 30.92,
  bottomY: 98,
  clipTopX: 70.05,
  clipBottomX: 30.11
};

const MOBILE_LINE = {
  topX: 68.3,
  topY: 1.5,
  bottomX: 30.9,
  bottomY: 95.8,
  clipTopX: 68.9,
  clipBottomX: 29.2
};

const DEFAULT_SLIDER = { autoplay: true, interval: 7, effect: 'fade', showArrows: true, showDots: true };

const SMOOTH = [0.65, 0, 0.35, 1];

const ARROW =
  'absolute top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-lg transition duration-300 hover:scale-105 hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 active:scale-90 sm:h-10 sm:w-10 lg:h-11 lg:w-11';

const ACTIONS_CONTRAST =
  '[&_a:first-child]:!border-border [&_a:first-child]:!bg-background [&_a:first-child]:!text-foreground [&_a:first-child:hover]:!bg-background/90 ' +
  '[&_button:first-child]:!border-border [&_button:first-child]:!bg-background [&_button:first-child]:!text-foreground [&_button:first-child:hover]:!bg-background/90 ' +
  '[&_a:not(:first-child)]:!border-primary-foreground [&_a:not(:first-child)]:!bg-transparent [&_a:not(:first-child)]:!text-primary-foreground [&_a:not(:first-child):hover]:!bg-primary-foreground/15 ' +
  '[&_button:not(:first-child)]:!border-primary-foreground [&_button:not(:first-child)]:!bg-transparent [&_button:not(:first-child)]:!text-primary-foreground [&_button:not(:first-child):hover]:!bg-primary-foreground/15';
const buildSlides = (hero) => {
  const list = (Array.isArray(hero.slides) ? hero.slides : []).filter(
    (slide) => slide && slide.isActive !== false && slide.title
  );

  if (list.length === 0) return [{ ...hero, company: '', logo: '' }];

  return list.map((slide) => ({
    ...hero,
    eyebrow: slide.eyebrow || '',
    title: slide.title,
    description: slide.description || '',
    image: slide.image,
    primaryCta: slide.primaryCta || { label: '', href: '' },
    secondaryCta: slide.secondaryCta || { label: '', href: '' },
    company: slide.company || '',
    logo: slide.logo && slide.logo.url ? slide.logo.url : ''
  }));
};

const slideX = ({ dir, rtl, mirrored }, distance) => {
  const physical = dir * (rtl ? -1 : 1) * distance;
  return mirrored && !rtl ? -physical : physical;
};

const photoVariants = {
  enter: (c) => ({
    opacity: 0,
    x: c.reduced ? 0 : c.first ? -30 : c.effect === 'slide' ? slideX(c, 60) : 0
  }),
  center: (c) => ({
    opacity: 1,
    x: 0,
    transition: { duration: c.reduced ? 0 : c.first ? 1.2 : 1.1, delay: c.first ? 0.3 : 0, ease: SMOOTH }
  }),
  exit: (c) => ({
    opacity: 0,
    x: c.reduced || c.effect !== 'slide' ? 0 : slideX(c, -60),
    transition: { duration: c.reduced ? 0 : 0.9, ease: SMOOTH }
  })
};

const shellVariants = {
  enter: (c) => ({
    opacity: c.first ? 1 : 0,
    x: c.reduced || c.first || c.effect !== 'slide' ? 0 : slideX(c, 36)
  }),
  center: (c) => ({ opacity: 1, x: 0, transition: { duration: c.reduced ? 0 : 0.7, ease: SMOOTH } }),
  exit: (c) => ({
    opacity: 0,
    x: c.reduced || c.effect !== 'slide' ? 0 : slideX(c, -36),
    transition: { duration: c.reduced ? 0 : 0.5, ease: SMOOTH }
  })
};

function CompanyLine({ slide, mobile = false }) {
  const logo = slide.logo ? optimizeImage(slide.logo) : '';
  if (!slide.company && !logo && !slide.eyebrow) return null;

  return (
    <motion.div
      variants={item}
      className={`flex w-fit max-w-full flex-wrap items-center border border-white/35 bg-white/10 text-white backdrop-blur-sm ${mobile
          ? 'mb-[2cqw] gap-[1.4cqw] rounded-[1.2cqw] px-[1.6cqw] py-[0.9cqw] text-[2.4cqw]'
          : 'mb-[1.2cqw] gap-[0.7cqw] rounded-[0.5cqw] px-[0.8cqw] py-[0.4cqw] text-[1.1cqw]'
        }`}
    >
      {logo && (
        <span className={`flex items-center bg-white/95 ${mobile ? 'rounded-[0.8cqw] p-[0.6cqw]' : 'rounded-[0.3cqw] p-[0.25cqw]'}`}>
          <img
            src={logo}
            alt=""
            decoding="async"
            className={mobile ? 'h-[4.5cqw] w-auto' : 'h-[2cqw] w-auto'}
          />
        </span>
      )}
      {slide.company && <span className="font-semibold">{slide.company}</span>}
      {slide.company && slide.eyebrow && (
        <span aria-hidden="true" className="h-[1em] w-px bg-white/40" />
      )}
      {slide.eyebrow && <span className="text-white/80">{slide.eyebrow}</span>}
    </motion.div>
  );
}

export default function HeroCentered({ hero }) {
  const t = useT();
  const reduced = useReducedMotion();
  const slides = useMemo(() => buildSlides(hero), [hero]);
  const slider = { ...DEFAULT_SLIDER, ...(hero.slider || {}) };
  const count = slides.length;
  const multiple = count > 1;

  const rootRef = useRef(null);
  const touchX = useRef(null);
  const [view, setView] = useState({ active: 0, dir: 1, first: true });
  const [rtl, setRtl] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);

  const active = Math.min(view.active, count - 1);
  const slide = slides[active];
  const image = slide.image && slide.image.url ? optimizeImage(slide.image.url) : '';
  const anyImage = slides.some((entry) => entry.image && entry.image.url);

  const running = multiple && slider.autoplay && pageVisible;

  const go = useCallback(
    (delta) =>
      setView((current) => ({
        active: (Math.min(current.active, count - 1) + delta + count) % count,
        dir: delta > 0 ? 1 : -1,
        first: false
      })),
    [count]
  );

  const jump = (index) =>
    setView((current) =>
      index === current.active ? current : { active: index, dir: index > current.active ? 1 : -1, first: false }
    );

  useEffect(() => {
    if (rootRef.current) setRtl(getComputedStyle(rootRef.current).direction === 'rtl');
  }, []);

  useEffect(() => {
    const onVisibility = () => setPageVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  useEffect(() => {
    if (!multiple) return;
    slides.forEach((entry) => {
      if (entry.image && entry.image.url) {
        const preload = new Image();
        preload.src = optimizeImage(entry.image.url);
      }
    });
  }, [slides, multiple]);

  useEffect(() => {
    if (!running) return undefined;
    const seconds = Math.max(4, Number(slider.interval) || 7);
    const timer = setTimeout(() => go(1), seconds * 1000);
    return () => clearTimeout(timer);
  }, [running, active, slider.interval, go]);

  const ctx = { dir: view.dir, rtl, effect: slider.effect, reduced: Boolean(reduced), first: view.first, mirrored: false };
  const desktopPhotoCtx = { ...ctx, mirrored: true };

  const onTouchStart = (event) => {
    touchX.current = event.touches[0].clientX;
  };

  const onTouchEnd = (event) => {
    if (touchX.current === null || !multiple) return;
    const dx = event.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) < 50) return;
    go(dx < 0 ? (rtl ? -1 : 1) : rtl ? 1 : -1);
  };

  const photoMotion = (context, key) => ({
    key,
    custom: context,
    variants: photoVariants,
    initial: 'enter',
    animate: 'center',
    exit: 'exit'
  });

  const shellMotion = (key) => ({
    key,
    custom: ctx,
    variants: shellVariants,
    initial: 'enter',
    animate: 'center',
    exit: 'exit',
    role: 'group',
    'aria-roledescription': 'slide',
    'aria-label': t('hero_slide', { n: active + 1, total: count })
  });

  return (
    <section
      ref={rootRef}
      id="home"
      role={multiple ? 'region' : undefined}
      aria-roledescription={multiple ? 'carousel' : undefined}
      aria-label={multiple ? t('hero_slider') : undefined}
      className="relative pt-20 pb-12 overflow-hidden isolate bg-background sm:pt-24 lg:pb-20"
    >
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none -z-10">
        <div
          className="absolute inset-0 bg-center bg-no-repeat bg-cover"
          style={{ backgroundImage: `url(${LINES_IMAGE})` }}
        />
        <div className="absolute inset-0 bg-background/90" />
      </div>

      <div className="px-4 mx-auto max-w-[1280px] sm:px-6">
        <div className="relative lg:px-12">
          <div
            aria-live="off"
            className="touch-pan-y"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <div className="relative hidden w-full mx-auto lg:block max-w-[1120px] aspect-[1310/750] [container-type:inline-size]">
              <img
                src={BG_IMAGE}
                alt=""
                decoding="async"
                draggable={false}
                className="absolute inset-0 w-full h-full select-none ltr:-scale-x-100"
              />

              {anyImage && (
                <div
                  className="absolute inset-0 ltr:-scale-x-100"
                  style={{
                    clipPath: `polygon(0 0, ${LINE.clipTopX}% 0, ${LINE.clipBottomX}% 100%, 0 100%)`
                  }}
                >
                  <div className={`absolute ${DESKTOP_PHOTO.box}`}>
                    <AnimatePresence custom={desktopPhotoCtx}>
                      {image && (
                        <motion.img
                          {...photoMotion(desktopPhotoCtx, `d-photo-${active}`)}
                          src={image}
                          alt=""
                          decoding="async"
                          className={`absolute inset-0 w-full h-full ${DESKTOP_PHOTO.fit}`}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              <svg
                aria-hidden="true"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="absolute inset-0 w-full h-full pointer-events-none ltr:-scale-x-100"
              >
                <line
                  x1={LINE.topX}
                  y1={LINE.topY}
                  x2={LINE.bottomX}
                  y2={LINE.bottomY}
                  stroke="white"
                  strokeWidth="1.4"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>

              <AnimatePresence mode="wait" custom={ctx}>
                <motion.div
                  {...shellMotion(`d-text-${active}`)}
                  className="absolute start-[4%] top-[27%] w-[38%]"
                >
                  <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="flex flex-col items-start w-full text-start"
                  >
                    <CompanyLine slide={slide} />
                    <HeroTitle
                      text={slide.title}
                      className="text-[3.2cqw] font-bold leading-[1.35] text-white"
                    />
                    <motion.p
                      variants={item}
                      className="mt-[1.4cqw] text-[1.5cqw] leading-[1.9] text-white/90"
                    >
                      {slide.description}
                    </motion.p>
                    <div className={`mt-[2.4cqw] ${ACTIONS_CONTRAST}`}>
                      <HeroActions hero={slide} />
                    </div>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="relative mx-auto w-full max-w-[560px] aspect-[385/540] lg:hidden [container-type:inline-size]">
              <img
                src={BG_MOBILE_IMAGE}
                alt=""
                decoding="async"
                draggable={false}
                className="absolute inset-0 w-full h-full select-none ltr:-scale-x-100"
              />

              {anyImage && (
                <div
                  className="absolute inset-0 ltr:-scale-x-100"
                  style={{
                    clipPath: `polygon(0 0, ${MOBILE_LINE.clipTopX}% 0, ${MOBILE_LINE.clipBottomX}% 100%, 0 100%)`
                  }}
                >
                  <div className="absolute left-[2.1%] top-[8%] h-[82%] w-[66%] ltr:-scale-x-100">
                    <AnimatePresence custom={ctx}>
                      {image && (
                        <motion.img
                          {...photoMotion(ctx, `m-photo-${active}`)}
                          src={image}
                          alt=""
                          decoding="async"
                          className="absolute inset-0 object-cover w-full h-full"
                          style={{ objectPosition: MOBILE_PHOTO_POSITION }}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              <svg
                aria-hidden="true"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="absolute inset-0 w-full h-full pointer-events-none ltr:-scale-x-100"
              >
                <line
                  x1={MOBILE_LINE.topX}
                  y1={MOBILE_LINE.topY}
                  x2={MOBILE_LINE.bottomX}
                  y2={MOBILE_LINE.bottomY}
                  stroke="white"
                  strokeWidth="1.2"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>

              <AnimatePresence mode="wait" custom={ctx}>
                <motion.div
                  {...shellMotion(`m-text-${active}`)}
                  className="absolute start-[7%] top-[12%] bottom-[8%] w-[33%]"
                >
                  <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="flex flex-col items-start justify-center w-full h-full text-start"
                  >
                    <CompanyLine slide={slide} mobile />
                    <HeroTitle
                      text={slide.title}
                      className="text-[4.9cqw] font-bold leading-[1.4] text-white"
                    />
                    <motion.p
                      variants={item}
                      className="mt-[2.2cqw] text-[3cqw] leading-[1.9] text-white/90 overflow-hidden [display:-webkit-box] [-webkit-line-clamp:3] [-webkit-box-orient:vertical]"
                    >
                      {slide.description}
                    </motion.p>
                    <div
                      className={`mt-[3.2cqw] w-full [&_a]:px-[2.4cqw] [&_a]:py-[1.7cqw] [&_a]:text-[2.8cqw] [&_a]:leading-none [&_button]:px-[2.4cqw] [&_button]:py-[1.7cqw] [&_button]:text-[2.8cqw] [&_button]:leading-none ${ACTIONS_CONTRAST}`}
                    >
                      <HeroActions hero={slide} />
                    </div>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {multiple && slider.showArrows !== false && (
            <>
              <button
                type="button"
                aria-label={t('carousel_prev')}
                onClick={() => go(-1)}
                className={`${ARROW} start-1 lg:start-0`}
              >
                <ChevronLeft size={20} aria-hidden="true" className="rtl:rotate-180" />
              </button>
              <button
                type="button"
                aria-label={t('carousel_next')}
                onClick={() => go(1)}
                className={`${ARROW} end-1 lg:end-0`}
              >
                <ChevronRight size={20} aria-hidden="true" className="rtl:rotate-180" />
              </button>
            </>
          )}

                    {multiple && slider.showDots !== false && (
            <div className="absolute inset-x-0 z-20 flex justify-center pointer-events-none bottom-2 lg:bottom-5">
              <div
                role="group"
                aria-label={t('hero_slider')}
                className="flex items-center gap-0.5 pointer-events-auto"
              >
                {slides.map((entry, index) => (
                  <button
                    key={`${entry.title}-${index}`}
                    type="button"
                    aria-label={t('hero_slide', { n: index + 1, total: count })}
                    aria-current={index === active ? 'true' : undefined}
                    onClick={() => jump(index)}
                    className="p-2 outline-none group"
                  >
                    <span
                      className={`block h-2.5 rounded-full transition-all duration-700 ease-in-out group-focus-visible:ring-2 group-focus-visible:ring-primary-foreground group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-primary ${
                        index === active
                          ? 'w-8 bg-primary-foreground'
                          : 'w-2.5 bg-primary-foreground/50 group-hover:bg-primary-foreground/80'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}