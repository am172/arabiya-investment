'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import Reveal from '@/components/ui/Reveal';
import VideoCard from '@/components/cards/VideoCard';
import SectionTitle from '@/components/ui/SectionTitle';
import VideoModal from '@/components/ui/VideoModal';
import { useT } from '@/components/providers/TextsProvider';

const PAUSE_MS = 3200;
const TRANSITION_MS = 650;

export default function ShowcaseSection({ videos, heading }) {
  const t = useT();
  const [active, setActive] = useState(null);
  const [open, setOpen] = useState(false);

  const listRef = useRef(null);
  const indexRef = useRef(0);
  const stepPxRef = useRef(0);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const didSwipeRef = useRef(false);

  const [isMobile, setIsMobile] = useState(false);
  const [paused, setPaused] = useState(false);
  const [activeSlot, setActiveSlot] = useState(0);
  const [animateCards, setAnimateCards] = useState(true);

  const ordered = useMemo(
    () => [...(videos || [])].sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured)).slice(0, 9),
    [videos]
  );

  const shouldLoop = ordered.length > 1;

  const baseItems = useMemo(() => {
    if (ordered.length === 0) return [];
    if (!shouldLoop) return ordered;
    const result = [...ordered];
    while (result.length < 4) {
      result.push(...ordered);
    }
    return result;
  }, [ordered, shouldLoop]);

  const baseLen = baseItems.length;

  const displayItems = useMemo(() => {
    if (!shouldLoop) return baseItems;
    return [
      ...baseItems,
      ...baseItems,
      ...baseItems,
      ...baseItems,
      ...baseItems
    ];
  }, [baseItems, shouldLoop]);

  const openVideo = useCallback((video) => {
    setActive(video);
    setOpen(true);
  }, []);

  const handleMobileOpen = useCallback(
    (video) => {
      if (didSwipeRef.current) return;
      openVideo(video);
    },
    [openVideo]
  );

  const close = useCallback(() => setOpen(false), []);

  const applyTransform = useCallback(
    (px, animate) => {
      const list = listRef.current;
      if (!list) return;
      list.style.transition = animate
        ? `transform ${TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`
        : 'none';
      list.style.transform = shouldLoop ? `translate3d(${px}px, 0, 0)` : 'none';
    },
    [shouldLoop]
  );

  const normalizePosition = useCallback(() => {
    const list = listRef.current;
    const stepPx = stepPxRef.current;
    if (!list || !shouldLoop || baseLen === 0 || stepPx === 0) return;

    const currentIdx = indexRef.current;
    if (currentIdx >= baseLen * 2 && currentIdx < baseLen * 3) return;

    const wrappedIdx = (((currentIdx % baseLen) + baseLen) % baseLen) + baseLen * 2;
    const diff = wrappedIdx - currentIdx;

    const matrix = new DOMMatrixReadOnly(window.getComputedStyle(list).transform);
    const currentX = matrix.m41 || 0;

    setAnimateCards(false);
    list.style.transition = 'none';
    list.style.transform = `translate3d(${currentX + diff * stepPx}px, 0, 0)`;
    void list.offsetHeight;

    indexRef.current = wrappedIdx;
    setActiveSlot(wrappedIdx);
  }, [shouldLoop, baseLen]);

  const moveBy = useCallback(
    (delta) => {
      if (!shouldLoop || stepPxRef.current === 0) return;
      normalizePosition();
      setAnimateCards(true);
      indexRef.current += delta;
      setActiveSlot(indexRef.current);
      applyTransform(indexRef.current * stepPxRef.current, true);
    },
    [shouldLoop, normalizePosition, applyTransform]
  );

  const goNext = useCallback(() => moveBy(1), [moveBy]);
  const goPrev = useCallback(() => moveBy(-1), [moveBy]);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const onChange = (e) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const measure = useCallback(() => {
    const list = listRef.current;
    if (!list || list.children.length < 2) {
      stepPxRef.current = 0;
      return;
    }
    const first = list.children[0];
    const second = list.children[1];
    const distance = Math.abs(second.offsetLeft - first.offsetLeft);
    stepPxRef.current = distance;
    applyTransform(indexRef.current * distance, false);
  }, [applyTransform]);

  useEffect(() => {
    const startIdx = shouldLoop ? baseLen * 2 : 0;
    indexRef.current = startIdx;
    setActiveSlot(startIdx);
    setAnimateCards(false);
    measure();
  }, [shouldLoop, baseLen, measure]);

  useEffect(() => {
    measure();
    const list = listRef.current;
    if (!list) return undefined;

    const ro = new ResizeObserver(measure);
    ro.observe(list);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [measure, displayItems]);

  useEffect(() => {
    if (!isMobile || !shouldLoop || paused || open) return undefined;
    const timer = setInterval(() => {
      goNext();
    }, PAUSE_MS);
    return () => clearInterval(timer);
  }, [isMobile, shouldLoop, paused, open, goNext]);

  const onTransitionEnd = (e) => {
    if (e.target !== listRef.current) return;
    if (!shouldLoop || baseLen === 0 || stepPxRef.current === 0) return;

    const currentIdx = indexRef.current;
    if (currentIdx < baseLen * 2 || currentIdx >= baseLen * 3) {
      const wrappedIdx = (((currentIdx % baseLen) + baseLen) % baseLen) + baseLen * 2;
      setAnimateCards(false);
      indexRef.current = wrappedIdx;
      setActiveSlot(wrappedIdx);
      applyTransform(wrappedIdx * stepPxRef.current, false);
    }
  };

  const onTouchStart = (e) => {
    if (!shouldLoop) return;
    setPaused(true);
    normalizePosition();
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    didSwipeRef.current = false;
  };

  const onTouchMove = (e) => {
    if (!shouldLoop || touchStartX.current === null) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - (touchStartY.current || 0);

    if (!didSwipeRef.current && Math.abs(dy) > Math.abs(dx)) {
      touchStartX.current = null;
      return;
    }

    if (Math.abs(dx) > 6) {
      didSwipeRef.current = true;
      applyTransform(indexRef.current * stepPxRef.current + dx, false);
    }
  };

  const onTouchEnd = (e) => {
    if (!shouldLoop) return;
    setPaused(false);
    if (touchStartX.current === null) return;

    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    touchStartY.current = null;

    if (Math.abs(dx) < 35) {
      applyTransform(indexRef.current * stepPxRef.current, true);
      setTimeout(() => {
        didSwipeRef.current = false;
      }, 50);
      return;
    }

    if (dx > 0) {
      goNext();
    } else {
      goPrev();
    }

    setTimeout(() => {
      didSwipeRef.current = false;
    }, 80);
  };

  if (ordered.length === 0) return null;

  const large = ordered.length >= 3;
  const activeRealIdx = (((activeSlot % ordered.length) + ordered.length) % ordered.length);

  return (
    <section
      id="showcase"
      className="relative py-20 overflow-hidden border-y border-border bg-surface scroll-mt-20 sm:py-28"
    >
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute -start-24 top-1/3 h-96 w-96 rounded-full bg-accent/10 blur-[130px]" />
        <div className="absolute -end-24 bottom-10 h-96 w-96 rounded-full bg-primary/10 blur-[130px]" />
      </div>

      <div className="relative px-5 mx-auto max-w-7xl sm:px-8">
        <SectionTitle {...heading} />

        <div className="mt-12 -mx-5 sm:hidden">
          <div
            className="overflow-hidden px-[8%] py-4 touch-pan-y select-none [perspective:1200px]"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <ul
              ref={listRef}
              onTransitionEnd={onTransitionEnd}
              className="flex gap-4 will-change-transform"
            >
              {displayItems.map((video, idx) => {
                const offset = idx - activeSlot;
                const isCenter = offset === 0;
                const cardTransform = isCenter
                  ? 'scale(1) translateY(0px) rotateY(0deg) rotateZ(0deg)'
                  : offset < 0
                    ? 'scale(0.87) translateY(10px) rotateY(-12deg) rotateZ(2deg)'
                    : 'scale(0.87) translateY(10px) rotateY(12deg) rotateZ(-2deg)';

                return (
                  <li
                    key={`mob-${video._id}-${idx}`}
                    className="w-full shrink-0"
                  >
                    <div
                      style={{
                        transform: shouldLoop ? cardTransform : 'none',
                        opacity: !shouldLoop || isCenter ? 1 : Math.abs(offset) === 1 ? 0.55 : 0.2,
                        transitionProperty: animateCards ? 'transform, opacity, box-shadow' : 'none',
                        transitionDuration: animateCards ? `${TRANSITION_MS}ms` : '0ms',
                        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)'
                      }}
                      className={`rounded-theme ${isCenter ? 'shadow-2xl shadow-primary/25 ring-1 ring-primary/30' : ''
                        }`}
                    >
                      <VideoCard video={video} large={false} onOpen={handleMobileOpen} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {shouldLoop && (
            <div className="flex items-center justify-center gap-1.5 mt-3">
              {ordered.map((v, i) => (
                <span
                  key={v._id}
                  className={`h-1.5 rounded-full transition-all duration-500 ${i === activeRealIdx
                    ? 'w-7 bg-primary'
                    : 'w-1.5 bg-foreground/20 dark:bg-white/20'
                    }`}
                />
              ))}
            </div>
          )}
        </div>

        <ul className="hidden gap-5 mt-14 sm:grid sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {ordered.map((video, index) => {
            const isLarge = large && index === 0;
            return (
              <Reveal
                key={video._id}
                as="li"
                delay={(index % 3) * 0.1}
                className={isLarge ? 'sm:col-span-2 lg:row-span-2' : ''}
              >
                <VideoCard video={video} large={isLarge} onOpen={openVideo} />
              </Reveal>
            );
          })}
        </ul>

        <Reveal delay={0.1} className="flex justify-center mt-10 sm:mt-12">
          <Button href="/student-stories" variant="outline" size="lg" className="group">
            {t('showcase_viewAll')}
            <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
          </Button>
        </Reveal>
      </div>

      <VideoModal video={active} open={open} onClose={close} />
    </section>
  );
}