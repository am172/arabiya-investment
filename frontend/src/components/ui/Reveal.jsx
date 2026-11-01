'use client';

import { motion, useReducedMotion } from 'framer-motion';

export default function Reveal({ children, delay = 0, y = 32, as = 'div', className = '' }) {
  const reduced = useReducedMotion();
  const Component = motion[as] || motion.div;

  return (
    <Component
      initial={reduced ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </Component>
  );
}