'use client';

import { useEffect, useRef } from 'react';
import { animate, useInView, useReducedMotion } from 'framer-motion';

const format = (number, prefix, suffix) =>
  `${prefix}${new Intl.NumberFormat('en-US').format(number)}${suffix}`;

export default function Counter({ value, prefix = '', suffix = '', duration = 2.2 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const reduced = useReducedMotion();
  const target = Number(value) || 0;

  useEffect(() => {
    if (!inView || !ref.current) return undefined;

    if (reduced) {
      ref.current.textContent = format(target, prefix, suffix);
      return undefined;
    }

    const controls = animate(0, target, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => {
        if (ref.current) ref.current.textContent = format(Math.round(latest), prefix, suffix);
      }
    });

    return () => controls.stop();
  }, [inView, reduced, target, prefix, suffix, duration]);

  return (
    <span ref={ref} aria-label={format(target, prefix, suffix)}>
      {format(0, prefix, suffix)}
    </span>
  );
}