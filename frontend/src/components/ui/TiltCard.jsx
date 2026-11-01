'use client';

import { useRef } from 'react';
import {
    motion,
    useMotionTemplate,
    useMotionValue,
    useReducedMotion,
    useSpring
} from 'framer-motion';

export default function TiltCard({ children, className = '', max = 8, scale = 1.02, glare = true }) {
    const ref = useRef(null);
    const reduced = useReducedMotion();
    const rotateXValue = useMotionValue(0);
    const rotateYValue = useMotionValue(0);
    const rotateX = useSpring(rotateXValue, { stiffness: 220, damping: 22 });
    const rotateY = useSpring(rotateYValue, { stiffness: 220, damping: 22 });
    const glareX = useMotionValue(50);
    const glareY = useMotionValue(50);
    const glareBackground = useMotionTemplate`radial-gradient(280px circle at ${glareX}% ${glareY}%, rgb(255 255 255 / 0.2), transparent 60%)`;

    const handleMove = (event) => {
        if (reduced || event.pointerType !== 'mouse' || !ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width;
        const py = (event.clientY - rect.top) / rect.height;
        rotateYValue.set((px - 0.5) * max * 2);
        rotateXValue.set(-(py - 0.5) * max * 2);
        glareX.set(px * 100);
        glareY.set(py * 100);
    };

    const handleLeave = () => {
        rotateXValue.set(0);
        rotateYValue.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onPointerMove={handleMove}
            onPointerLeave={handleLeave}
            whileHover={reduced ? undefined : { scale }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            style={{ rotateX, rotateY, transformPerspective: 1000 }}
            className={`group/tilt relative ${className}`}
        >
            {children}
            {glare && (
                <motion.span
                    aria-hidden="true"
                    style={{ background: glareBackground }}
                    className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover/tilt:opacity-100"
                />
            )}
        </motion.div>
    );
}