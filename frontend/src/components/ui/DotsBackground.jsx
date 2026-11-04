'use client';

import { useEffect, useRef } from 'react';

const SPACING = 30;

export default function DotsBackground({ className = '' }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return undefined;

        const ctx = canvas.getContext('2d');
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        let width = 0;
        let height = 0;
        let frame = 0;
        let raf = 0;
        let visible = true;
        let color = getComputedStyle(canvas).color;
        const mouse = { x: -9999, y: -9999 };

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = canvas.clientWidth;
            height = canvas.clientHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        const draw = (time) => {
            const t = time * 0.001;
            frame += 1;
            if (frame % 40 === 0) color = getComputedStyle(canvas).color;

            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = color;

            const cols = Math.ceil(width / SPACING) + 1;
            const rows = Math.ceil(height / SPACING) + 1;

            for (let i = 0; i < cols; i += 1) {
                for (let j = 0; j < rows; j += 1) {
                    const bx = i * SPACING;
                    const by = j * SPACING;

                    const wave = (Math.sin(bx * 0.011 + t * 0.7) + Math.cos(by * 0.013 + t * 0.5) + 2) / 4;
                    const sweep = Math.max(0, Math.sin((bx + by) * 0.006 - t * 0.9));

                    let x = bx + Math.cos(t * 0.55 + j * 0.45) * 5;
                    let y = by + Math.sin(t * 0.65 + i * 0.4) * 5;

                    const dx = x - mouse.x;
                    const dy = y - mouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    let boost = 0;

                    if (dist < 150) {
                        const force = (1 - dist / 150) * 22;
                        x += (dx / (dist || 1)) * force;
                        y += (dy / (dist || 1)) * force;
                        boost = 1 - dist / 150;
                    }

                    const radius = 0.9 + wave * 1.1 + sweep * 0.9 + boost * 1.6;
                    const alpha = Math.min(1, 0.12 + wave * 0.3 + sweep * 0.35 + boost * 0.4);

                    ctx.globalAlpha = alpha;
                    ctx.beginPath();
                    ctx.arc(x, y, radius, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            ctx.globalAlpha = 1;
        };

        const loop = (time) => {
            if (visible) draw(time);
            raf = requestAnimationFrame(loop);
        };

        const onMove = (event) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = event.clientX - rect.left;
            mouse.y = event.clientY - rect.top;
        };

        const onLeave = () => {
            mouse.x = -9999;
            mouse.y = -9999;
        };

        resize();

        const resizeObserver = new ResizeObserver(() => {
            resize();
            if (reduced) draw(0);
        });
        resizeObserver.observe(canvas);

        const visibilityObserver = new IntersectionObserver(
            ([entry]) => {
                visible = entry.isIntersecting;
            },
            { threshold: 0 }
        );
        visibilityObserver.observe(canvas);

        if (reduced) {
            draw(0);
        } else {
            raf = requestAnimationFrame(loop);
            window.addEventListener('pointermove', onMove, { passive: true });
            document.addEventListener('pointerleave', onLeave);
        }

        return () => {
            cancelAnimationFrame(raf);
            resizeObserver.disconnect();
            visibilityObserver.disconnect();
            window.removeEventListener('pointermove', onMove);
            document.removeEventListener('pointerleave', onLeave);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 h-full w-full text-primary ${className}`}
        />
    );
}