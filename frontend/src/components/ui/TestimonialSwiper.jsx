'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import TestimonialCard from '@/components/cards/TestimonialCard';
import { useT } from '@/components/providers/TextsProvider';

const GAP = 16;

export default function TestimonialSwiper({ testimonials }) {
  const t = useT();
  const trackRef = useRef(null);
  const frame = useRef(0);
  const [state, setState] = useState({ progress: 0, thumb: 100 });

  const update = useCallback(() => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const element = trackRef.current;
      if (!element) return;
      const max = element.scrollWidth - element.clientWidth;
      const thumb = element.scrollWidth
        ? Math.min(100, (element.clientWidth / element.scrollWidth) * 100)
        : 100;
      const progress = max > 0 ? Math.min(1, Math.max(0, Math.abs(element.scrollLeft) / max)) : 0;
      setState((previous) =>
        previous.progress === progress && previous.thumb === thumb ? previous : { progress, thumb }
      );
    });
  }, []);

  useEffect(() => {
    const element = trackRef.current;
    if (!element) return undefined;
    update();
    element.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(frame.current);
      element.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [update, testimonials]);

  const step = (direction) => {
    const element = trackRef.current;
    if (!element || !element.firstElementChild) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const rtl = getComputedStyle(element).direction === 'rtl';
    element.scrollBy({
      left: (rtl ? -direction : direction) * (element.firstElementChild.offsetWidth + GAP),
      behavior: reduced ? 'auto' : 'smooth'
    });
  };

  const total = testimonials.length;
  const current = total > 1 ? Math.round(state.progress * (total - 1)) + 1 : 1;
  const left = state.progress * (100 - state.thumb);

  const controlClass =
    'flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-foreground transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <div role="region" aria-label={t('testimonials_region')}>
      <ul
        ref={trackRef}
        tabIndex={0}
        className="flex items-stretch gap-4 px-5 pt-1 pb-2 -mx-5 overflow-x-auto scrollbar-hide mask-fade-x snap-x snap-mandatory overscroll-x-contain scroll-px-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 sm:-mx-8 sm:scroll-px-8 sm:px-8"
      >
        {testimonials.map((testimonial) => (
          <li key={testimonial._id} className="flex w-[85%] max-w-sm shrink-0 snap-start">
            <TestimonialCard
              testimonial={testimonial}
              className="w-full"
              starsLabel={t('testimonials_stars')}
            />
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-4 mt-5">
        <div className="relative flex-1 h-1 overflow-hidden rounded-full bg-border">
          <span
            aria-hidden="true"
            className="absolute inset-y-0 rounded-full start-0 bg-primary"
            style={{ width: `${state.thumb}%`, insetInlineStart: `${left}%` }}
          />
        </div>
        <span className="text-xs font-medium tabular-nums text-muted">
          {current} / {total}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label={t('testimonials_prev')}
            disabled={state.progress <= 0.01}
            onClick={() => step(-1)}
            className={controlClass}
          >
            <ChevronRight size={18} />
          </button>
          <button
            type="button"
            aria-label={t('testimonials_next')}
            disabled={state.progress >= 0.99}
            onClick={() => step(1)}
            className={controlClass}
          >
            <ChevronLeft size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}