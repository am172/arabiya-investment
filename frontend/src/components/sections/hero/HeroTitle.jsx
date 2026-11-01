'use client';

import { motion } from 'framer-motion';
import { item } from './shared';

export default function HeroTitle({ text, className = '', gradientLast = false }) {
  const lines = String(text)
    .split('\n')
    .filter((line) => line.trim());

  return (
    <motion.h1
      variants={item}
      className={`text-balance font-arabic font-extrabold leading-[1.4] ${className}`}
    >
      {lines.map((line, index) => {
        const highlight = gradientLast && lines.length > 1 && index === lines.length - 1;
        return (
          <span
            key={`${index}-${line}`}
            className={`block ${highlight
                ? 'bg-gradient-to-l from-primary via-accent to-secondary bg-clip-text py-1 text-transparent'
                : ''
              }`}
          >
            {line}
          </span>
        );
      })}
    </motion.h1>
  );
}