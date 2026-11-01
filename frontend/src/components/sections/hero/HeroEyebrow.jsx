'use client';

import { motion } from 'framer-motion';
import { item } from './shared';

export default function HeroEyebrow({ text, onImage = false }) {
    if (!text) return null;

    return (
        <motion.span
            variants={item}
            className={`inline-flex items-center gap-2.5 rounded-full border px-4 py-1.5 text-sm font-semibold backdrop-blur-md sm:text-base ${onImage
                    ? 'border-white/25 bg-white/10 text-white'
                    : 'border-border bg-surface/70 text-muted'
                }`}
        >
            <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex w-full h-full rounded-full animate-pulse-ring bg-success" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
            </span>
            {text}
        </motion.span>
    );
}