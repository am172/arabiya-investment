'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import HeroActions from './HeroActions';
import HeroTitle from './HeroTitle';
import { container, item } from './shared';
import { useT } from '@/components/providers/TextsProvider';
import { optimizeImage } from '@/lib/utils/image';

const BG_IMAGE = '/images/hero/hero-bg.png';
const BG_MOBILE_IMAGE = '/images/hero/hero-bg-mobile.png';

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

const SWAP_DELAY = 0.5;

const ARROW =
  'absolute top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-lg transition duration-300 hover:scale-105 hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 active:scale-90 dark:border-white/15 dark:bg-[#0D1F36]/80 dark:text-white dark:hover:border-white/40 dark:hover:bg-[#152C4A] sm:h-10 sm:w-10 lg:h-11 lg:w-11';

/*
 * Hero buttons:
 *  - first child  -> solid white pill with deep navy text
 *  - other children -> outlined pill matching the dark navy theme
 */
const ACTIONS_CONTRAST =
  '[&_a:first-child]:!rounded-full [&_a:first-child]:!border-transparent [&_a:first-child]:!bg-white [&_a:first-child]:!font-semibold [&_a:first-child]:!text-[#09182C] [&_a:first-child:hover]:!bg-slate-100 ' +
  '[&_button:first-child]:!rounded-full [&_button:first-child]:!border-transparent [&_button:first-child]:!bg-white [&_button:first-child]:!font-semibold [&_button:first-child]:!text-[#09182C] [&_button:first-child:hover]:!bg-slate-100 ' +
  '[&_a:not(:first-child)]:!rounded-full [&_a:not(:first-child)]:!border [&_a:not(:first-child)]:!border-white/40 [&_a:not(:first-child)]:!bg-white/5 [&_a:not(:first-child)]:!font-medium [&_a:not(:first-child)]:!text-white [&_a:not(:first-child):hover]:!bg-white/15 ' +
  'dark:[&_a:not(:first-child)]:!border-[#3A506B] dark:[&_a:not(:first-child)]:!bg-[#0B1B30]/60 dark:[&_a:not(:first-child):hover]:!border-white/50 dark:[&_a:not(:first-child):hover]:!bg-[#132844] ' +
  '[&_button:not(:first-child)]:!rounded-full [&_button:not(:first-child)]:!border [&_button:not(:first-child)]:!border-white/40 [&_button:not(:first-child)]:!bg-white/5 [&_button:not(:first-child)]:!font-medium [&_button:not(:first-child)]:!text-white [&_button:not(:first-child):hover]:!bg-white/15 ' +
  'dark:[&_button:not(:first-child)]:!border-[#3A506B] dark:[&_button:not(:first-child)]:!bg-[#0B1B30]/60 dark:[&_button:not(:first-child):hover]:!border-white/50 dark:[&_button:not(:first-child):hover]:!bg-[#132844]';

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
  center: (c) => ({
    opacity: 1,
    x: 0,
    transition: { duration: c.reduced ? 0 : 0.7, delay: c.reduced || c.first ? 0 : SWAP_DELAY, ease: SMOOTH }
  }),
  exit: (c) => ({
    opacity: 0,
    x: c.reduced || c.effect !== 'slide' ? 0 : slideX(c, -36),
    transition: { duration: c.reduced ? 0 : 0.5, ease: SMOOTH }
  })
};

const maskStyle = (src) => ({
  WebkitMaskImage: `url(${src})`,
  maskImage: `url(${src})`,
  WebkitMaskSize: '100% 100%',
  maskSize: '100% 100%',
  WebkitMaskRepeat: 'no-repeat',
  maskRepeat: 'no-repeat'
});

/*
 * Dark mode lowers the base PNG luminosity while keeping the 3D perspective grid visible,
 * blends the deep midnight-navy gradient, and adds a subtle bottom spotlight under the buttons.
 */
function TintedBackground({ src }) {
  const mask = maskStyle(src);

  return (
    <div className="absolute inset-0 isolate ltr:-scale-x-100 drop-shadow-[0_12px_28px_rgba(15,23,42,0.18)] dark:drop-shadow-[0_18px_36px_rgba(0,0,0,0.65)]">
      <img
        src={src}
        alt=""
        decoding="async"
        draggable={false}
        className="absolute inset-0 w-full h-full select-none dark:brightness-[0.38] dark:contrast-[1.18] dark:saturate-[0.85]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden mix-blend-color bg-gradient-to-br from-[#0D213B] via-[#09182C] to-[#06101E] dark:block"
        style={mask}
      />
      {/* Subtle Bottom Spotlight: softly illuminates the grid beneath the action buttons */}
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden pointer-events-none mix-blend-screen dark:block"
        style={{
          ...mask,
          background:
            'radial-gradient(46% 36% at 72% 96%, rgba(37, 99, 235, 0.24) 0%, rgba(14, 165, 233, 0.09) 45%, rgba(6, 16, 30, 0) 78%)'
        }}
      />
    </div>
  );
}

function CompanyLine({ slide, mobile = false }) {
  const logo = slide.logo ? optimizeImage(slide.logo) : '';
  if (!slide.company && !logo && !slide.eyebrow) return null;

  return (
    <motion.div
      variants={item}
      className={`flex w-fit max-w-full flex-wrap items-center border border-white/25 bg-white/10 text-white backdrop-blur-sm dark:border-[#2B4260] dark:bg-[#13263E]/90 ${mobile
        ? 'mb-[2cqw] gap-[1.4cqw] rounded-[1.2cqw] px-[1.8cqw] py-[0.9cqw] text-[2.4cqw]'
        : 'mb-[1.2cqw] gap-[0.7cqw] rounded-[0.45cqw] px-[1cqw] py-[0.38cqw] text-[1.05cqw]'
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
      {slide.company && <span className="font-medium text-white/95">{slide.company}</span>}
      {slide.company && slide.eyebrow && (
        <span aria-hidden="true" className="h-[1em] w-px bg-white/40 dark:bg-white/25" />
      )}
      {slide.eyebrow && <span className="text-white/80 dark:text-slate-300">{slide.eyebrow}</span>}
    </motion.div>
  );
}

function TextLayer({ active, ctx, label, className, innerClassName, children }) {
  const controls = useAnimationControls();
  const layerRef = useRef(null);
  const initialVariant = useRef(active ? 'enter' : 'exit');
  const [shown, setShown] = useState(active);

  useEffect(() => {
    if (layerRef.current) layerRef.current.inert = !active;
  }, [active]);

  useEffect(() => {
    const wait = ctx.first || ctx.reduced ? 0 : SWAP_DELAY * 1000;

    if (active) {
      controls.set('enter');
      controls.start('center');
      const timer = setTimeout(() => setShown(true), wait);
      return () => clearTimeout(timer);
    }

    controls.start('exit');
    const timer = setTimeout(() => setShown(false), 700);
    return () => clearTimeout(timer);
  }, [active]);

  return (
    <motion.div
      ref={layerRef}
      custom={ctx}
      variants={shellVariants}
      initial={initialVariant.current}
      animate={controls}
      role="group"
      aria-roledescription="slide"
      aria-label={label}
      aria-hidden={active ? undefined : true}
      className={className}
    >
      <motion.div
        variants={container}
        initial="hidden"
        animate={shown ? 'show' : 'hidden'}
        className={innerClassName}
      >
        {children}
      </motion.div>
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
    const sync = () => {
      if (rootRef.current) setRtl(getComputedStyle(rootRef.current).direction === 'rtl');
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['dir'] });
    return () => observer.disconnect();
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

  return (
    <section
      ref={rootRef}
      id="home"
      role={multiple ? 'region' : undefined}
      aria-roledescription={multiple ? 'carousel' : undefined}
      aria-label={multiple ? t('hero_slider') : undefined}
      className="relative pt-20 pb-12 overflow-hidden isolate bg-background sm:pt-24 lg:pb-20"
    >
      {/* Page background + diagonal architectural lines (light #F8FAFC / dark #111317) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none -z-10 bg-[rgb(248_250_252)] dark:bg-[rgb(5_9_25)]"
      >

        <div className="absolute inset-0 [background-image:repeating-linear-gradient(135deg,rgba(15,23,42,0.04)_0,rgba(15,23,42,0.04)_1px,transparent_1px,transparent_14px)] dark:[background-image:repeating-linear-gradient(135deg,rgba(255,255,255,0.035)_0,rgba(255,255,255,0.035)_1px,transparent_1px,transparent_12px)]" />
      </div>

      {/* Same outer geometry as the Navbar */}
      <div className="px-4 mx-auto max-w-[1280px] sm:px-6">
        <div className="relative lg:px-12">
          <div
            aria-live="off"
            className="touch-pan-y"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <div className="relative hidden w-full mx-auto lg:block max-w-[1120px] aspect-[1310/750] [container-type:inline-size]">
              <TintedBackground src={BG_IMAGE} />

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
                          className={`absolute inset-0 w-full h-full dark:brightness-[0.75] dark:contrast-[1.05] ${DESKTOP_PHOTO.fit}`}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* White separator line in light mode, hidden in dark mode to match design */}
              <svg
                aria-hidden="true"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="absolute inset-0 w-full h-full pointer-events-none ltr:-scale-x-100 dark:hidden"
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

              {slides.map((entry, index) => (
                <TextLayer
                  key={`d-text-${entry.title}-${index}`}
                  active={index === active}
                  ctx={ctx}
                  label={t('hero_slide', { n: index + 1, total: count })}
                  className="absolute start-[4%] top-[24%] bottom-[12%] w-[38%]"
                  innerClassName="flex flex-col items-start justify-center w-full h-full text-start"
                >
                  <CompanyLine slide={entry} />
                  <HeroTitle
                    text={entry.title}
                    className="text-[3.2cqw] font-bold leading-[1.35] text-white"
                  />
                  <motion.p
                    variants={item}
                    className="mt-[1.4cqw] w-[108%] max-w-none text-balance text-[1.45cqw] leading-[1.9] text-white/90 dark:text-[#94A3B8] overflow-hidden [display:-webkit-box] [-webkit-line-clamp:3] [-webkit-box-orient:vertical]"
                  >
                    {entry.description}
                  </motion.p>
                  <div className={`relative mt-[2.4cqw] shrink-0 ${ACTIONS_CONTRAST}`}>
                    {/* Low-intensity soft spotlight glow behind the buttons */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -inset-x-5 -bottom-4 -top-2 -z-10 rounded-full bg-[radial-gradient(closest-side,rgba(56,189,248,0.10),rgba(37,99,235,0.05),transparent)] blur-xl dark:bg-[radial-gradient(closest-side,rgba(37,99,235,0.20),rgba(14,165,233,0.08),transparent)]"
                    />
                    <HeroActions hero={entry} />
                  </div>
                </TextLayer>
              ))}
            </div>

            <div className="relative mx-auto w-full max-w-[560px] aspect-[385/540] lg:hidden [container-type:inline-size]">
              <TintedBackground src={BG_MOBILE_IMAGE} />

              {anyImage && (
                <div
                  className="absolute inset-0 ltr:-scale-x-100"
                  style={{
                    clipPath: `polygon(0 0, ${MOBILE_LINE.clipTopX}% 0, ${MOBILE_LINE.clipBottomX}% 100%, 0 100%)`
                  }}
                >
                  <div className="absolute left-[2.1%] top-[8%] h-[82%] w-[66%]">
                    <AnimatePresence custom={desktopPhotoCtx}>
                      {image && (
                        <motion.img
                          {...photoMotion(desktopPhotoCtx, `m-photo-${active}`)}
                          src={image}
                          alt=""
                          decoding="async"
                          className="absolute inset-0 object-cover w-full h-full dark:brightness-[0.75] dark:contrast-[1.05]"
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
                className="absolute inset-0 w-full h-full pointer-events-none ltr:-scale-x-100 dark:hidden"
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

              {slides.map((entry, index) => (
                <TextLayer
                  key={`m-text-${entry.title}-${index}`}
                  active={index === active}
                  ctx={ctx}
                  label={t('hero_slide', { n: index + 1, total: count })}
                  className="absolute start-[7%] top-[12%] bottom-[12%] w-[33%]"
                  innerClassName="flex flex-col items-start justify-center w-full h-full text-start"
                >
                  <CompanyLine slide={entry} mobile />
                  <HeroTitle
                    text={entry.title}
                    className="text-[4.9cqw] font-bold leading-[1.4] text-white"
                  />
                  <motion.p
                    variants={item}
                    className="mt-[2.2cqw] text-pretty text-[3cqw] leading-[1.9] text-white/90 dark:text-[#94A3B8] overflow-hidden [display:-webkit-box] [-webkit-line-clamp:3] [-webkit-box-orient:vertical]"
                  >
                    {entry.description}
                  </motion.p>
                  <div
                    className={`relative mt-[3.2cqw] w-full [&_a]:px-[2.4cqw] [&_a]:py-[1.7cqw] [&_a]:text-[2.8cqw] [&_a]:leading-none [&_button]:px-[2.4cqw] [&_button]:py-[1.7cqw] [&_button]:text-[2.8cqw] [&_button]:leading-none ${ACTIONS_CONTRAST}`}
                  >
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -inset-x-3 -bottom-3 -top-2 -z-10 rounded-full bg-[radial-gradient(closest-side,rgba(56,189,248,0.10),transparent)] blur-lg dark:bg-[radial-gradient(closest-side,rgba(37,99,235,0.18),rgba(14,165,233,0.07),transparent)]"
                    />
                    <HeroActions hero={entry} />
                  </div>
                </TextLayer>
              ))}
            </div>
          </div>

          {multiple && slider.showArrows !== false && (
            <>
              <button
                type="button"
                aria-label={t('carousel_prev')}
                onClick={() => go(-1)}
                className={`${ARROW} start-1 lg:start-0 dark:hidden`}
              >
                <ChevronLeft size={20} aria-hidden="true" className="rtl:rotate-180" />
              </button>
              <button
                type="button"
                aria-label={t('carousel_next')}
                onClick={() => go(1)}
                className={`${ARROW} end-1 lg:end-0 dark:hidden`}
              >
                <ChevronRight size={20} aria-hidden="true" className="rtl:rotate-180" />
              </button>
            </>
          )}

          {multiple && slider.showDots !== false && (
            <div
              role="group"
              aria-label={t('hero_slider')}
              className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-0.5 rounded-full bg-black/25 px-2 py-0.5 backdrop-blur-md dark:bg-transparent dark:px-0 dark:py-0 dark:backdrop-blur-none"
            >
              {slides.map((entry, index) => (
                <button
                  key={`${entry.title}-${index}`}
                  type="button"
                  aria-label={t('hero_slide', { n: index + 1, total: count })}
                  aria-current={index === active ? 'true' : undefined}
                  onClick={() => jump(index)}
                  className="p-1.5 outline-none group"
                >
                  <span
                    className={`block h-2 rounded-full transition-all duration-700 ease-in-out group-focus-visible:ring-2 group-focus-visible:ring-white ${index === active
                      ? 'w-7 bg-white dark:bg-white'
                      : 'w-2 bg-white/50 group-hover:bg-white/80 dark:bg-white/35 dark:group-hover:bg-white/60'
                      }`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}