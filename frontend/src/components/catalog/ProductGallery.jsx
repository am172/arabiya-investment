'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Package, X, ZoomIn, ZoomOut } from 'lucide-react';

const NAV =
    'flex h-11 w-11 items-center justify-center rounded-full bg-background/90 text-foreground shadow-lg backdrop-blur transition hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 active:scale-90';

const FOCUSABLE = 'button:not([disabled])';
const ZOOM_LEVEL = 2.5; // مقدار التكبير (غيّره زي ما تحب)

export default function ProductGallery({ images = [], name, labels }) {
    const ordered = useMemo(
        () => [...images].sort((a, b) => Number(Boolean(b.isCover)) - Number(Boolean(a.isCover))),
        [images]
    );
    const total = ordered.length;
    const [index, setIndex] = useState(0);
    const [open, setOpen] = useState(false);
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [dragging, setDragging] = useState(false);

    const rootRef = useRef(null);
    const boxRef = useRef(null);
    const closeRef = useRef(null);
    const openerRef = useRef(null);
    const zoomBoxRef = useRef(null);
    const touchX = useRef(null);
    const drag = useRef(null);

    const zoomed = scale > 1;

    const resetZoom = useCallback(() => {
        setScale(1);
        setOffset({ x: 0, y: 0 });
    }, []);

    const go = useCallback((delta) => setIndex((value) => (value + delta + total) % total), [total]);

    const isRtl = () => rootRef.current && getComputedStyle(rootRef.current).direction === 'rtl';

    // إرجاع التكبير عند تغيير الصورة أو فتح/غلق العرض
    useEffect(() => {
        resetZoom();
    }, [index, open, resetZoom]);

    useEffect(() => {
        if (!open) return undefined;

        const overflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        if (closeRef.current) closeRef.current.focus();
        const opener = openerRef.current;

        const onKey = (event) => {
            if (event.key === 'Escape') {
                setOpen(false);
                return;
            }
            if (event.key === 'ArrowRight') go(isRtl() ? -1 : 1);
            if (event.key === 'ArrowLeft') go(isRtl() ? 1 : -1);

            if (event.key === 'Tab' && boxRef.current) {
                const items = [...boxRef.current.querySelectorAll(FOCUSABLE)];
                if (items.length === 0) return;
                const first = items[0];
                const last = items[items.length - 1];
                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            }
        };

        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = overflow;
            if (opener && opener.focus) opener.focus();
        };
    }, [open, go]);

    /* ---------- السحب للتنقل بين الصور (فقط وهي غير مكبّرة) ---------- */
    const onTouchStart = (event) => {
        touchX.current = event.touches[0].clientX;
    };

    const onTouchEnd = (event) => {
        if (touchX.current === null || total < 2 || zoomed) {
            touchX.current = null;
            return;
        }
        const dx = event.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) < 50) return;
        const rtl = isRtl();
        go(dx < 0 ? (rtl ? -1 : 1) : rtl ? 1 : -1);
    };

    /* ---------- التكبير داخل العرض الكامل ---------- */
    const clamp = (x, y, s) => {
        const rect = zoomBoxRef.current?.getBoundingClientRect();
        if (!rect) return { x, y };
        const maxX = (rect.width * (s - 1)) / 2;
        const maxY = (rect.height * (s - 1)) / 2;
        return {
            x: Math.max(-maxX, Math.min(maxX, x)),
            y: Math.max(-maxY, Math.min(maxY, y)),
        };
    };

    const zoomAt = (clientX, clientY, nextScale) => {
        const rect = zoomBoxRef.current?.getBoundingClientRect();
        if (!rect) return;
        const dx = clientX - (rect.left + rect.width / 2);
        const dy = clientY - (rect.top + rect.height / 2);
        setScale(nextScale);
        setOffset(clamp(-dx * (nextScale - 1), -dy * (nextScale - 1), nextScale));
    };

    const onPointerDown = (event) => {
        drag.current = {
            startX: event.clientX,
            startY: event.clientY,
            ox: offset.x,
            oy: offset.y,
            moved: false,
        };
        if (zoomed) {
            event.currentTarget.setPointerCapture(event.pointerId);
            setDragging(true);
        }
    };

    const onPointerMove = (event) => {
        const d = drag.current;
        if (!d) return;
        const dx = event.clientX - d.startX;
        const dy = event.clientY - d.startY;
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) d.moved = true;
        if (zoomed && d.moved) setOffset(clamp(d.ox + dx, d.oy + dy, scale));
    };

    const onPointerUp = (event) => {
        const d = drag.current;
        drag.current = null;
        setDragging(false);
        if (!d || d.moved) return; // كان سحب وليس لمسة
        if (zoomed) resetZoom();
        else zoomAt(event.clientX, event.clientY, ZOOM_LEVEL);
    };

    const onWheel = (event) => {
        if (event.deltaY < 0 && !zoomed) zoomAt(event.clientX, event.clientY, ZOOM_LEVEL);
        else if (event.deltaY > 0 && zoomed) resetZoom();
    };

    const toggleZoomFromButton = () => {
        if (zoomed) return resetZoom();
        const rect = zoomBoxRef.current?.getBoundingClientRect();
        if (rect) zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, ZOOM_LEVEL);
    };

    if (total === 0) {
        return (
            <div className="flex aspect-[4/3] items-center justify-center rounded-theme border border-border bg-gradient-to-br from-primary/10 to-accent/10 text-primary/30">
                <Package size={72} aria-hidden="true" />
            </div>
        );
    }

    const current = ordered[index];

    return (
        <div ref={rootRef} role="group" aria-roledescription="carousel" aria-label={labels.gallery}>
            <div
                className="relative aspect-[4/3] overflow-hidden rounded-theme border border-border bg-gradient-to-br from-primary/5 to-accent/5"
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
            >
                <button
                    ref={openerRef}
                    type="button"
                    aria-label={labels.open}
                    onClick={() => setOpen(true)}
                    className="absolute inset-0 group cursor-zoom-in focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-primary/40"
                >
                    {/* الصورة تملأ الإطار بالكامل */}
                    <Image
                        key={current.url}
                        src={current.url}
                        alt={current.alt || name}
                        fill
                        priority
                        sizes="(min-width: 1024px) 45vw, 95vw"
                        className="object-cover"
                    />
                    <span
                        aria-hidden="true"
                        className="absolute flex items-center justify-center transition rounded-full shadow opacity-0 end-3 top-3 h-9 w-9 bg-background/90 group-hover:opacity-100 group-focus-visible:opacity-100"
                    >
                        <ZoomIn size={17} />
                    </span>
                </button>

                {total > 1 && (
                    <>
                        <button type="button" aria-label={labels.prev} onClick={() => go(-1)} className={`${NAV} absolute start-3 top-1/2 -translate-y-1/2`}>
                            <ChevronLeft size={20} aria-hidden="true" className="rtl:rotate-180" />
                        </button>
                        <button type="button" aria-label={labels.next} onClick={() => go(1)} className={`${NAV} absolute end-3 top-1/2 -translate-y-1/2`}>
                            <ChevronRight size={20} aria-hidden="true" className="rtl:rotate-180" />
                        </button>
                        <span
                            dir="ltr"
                            aria-live="polite"
                            className="absolute px-3 py-1 text-xs font-semibold rounded-full shadow bottom-3 start-3 bg-background/90 tabular-nums"
                        >
                            {index + 1} / {total}
                        </span>
                    </>
                )}
            </div>

            {total > 1 && (
                <ul className="grid grid-cols-5 gap-2 mt-3 sm:grid-cols-6">
                    {ordered.map((image, position) => (
                        <li key={image.url}>
                            <button
                                type="button"
                                aria-label={`${labels.gallery} ${position + 1}`}
                                aria-current={position === index}
                                onClick={() => setIndex(position)}
                                className={`relative block aspect-square w-full overflow-hidden rounded-xl border-2 bg-surface transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 ${position === index ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'
                                    }`}
                            >
                                <Image src={image.url} alt="" fill sizes="110px" className="object-cover" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {open && (
                <div
                    ref={boxRef}
                    role="dialog"
                    aria-modal="true"
                    aria-label={labels.gallery}
                    className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 p-4"
                    onTouchStart={onTouchStart}
                    onTouchEnd={onTouchEnd}
                >
                    <button
                        ref={closeRef}
                        type="button"
                        aria-label={labels.close}
                        onClick={() => setOpen(false)}
                        className={`${NAV} absolute end-4 top-4 z-10`}
                    >
                        <X size={20} />
                    </button>

                    <button
                        type="button"
                        aria-label={labels.zoom || 'Zoom'}
                        onClick={toggleZoomFromButton}
                        className={`${NAV} absolute start-4 top-4 z-10`}
                    >
                        {zoomed ? <ZoomOut size={20} /> : <ZoomIn size={20} />}
                    </button>

                    {/* منطقة الصورة: لمسة = تكبير/تصغير، سحب = تحريك */}
                    <div
                        ref={zoomBoxRef}
                        className={`relative w-full h-full max-w-6xl overflow-hidden select-none ${zoomed ? (dragging ? 'cursor-grabbing' : 'cursor-zoom-out') : 'cursor-zoom-in'
                            }`}
                        style={{ touchAction: zoomed ? 'none' : 'pan-y' }}
                        onPointerDown={onPointerDown}
                        onPointerMove={onPointerMove}
                        onPointerUp={onPointerUp}
                        onPointerCancel={() => {
                            drag.current = null;
                            setDragging(false);
                        }}
                        onWheel={onWheel}
                    >
                        <div
                            className={`absolute inset-0 ${dragging ? '' : 'transition-transform duration-200 ease-out'}`}
                            style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})` }}
                        >
                            <Image
                                key={current.url}
                                src={current.url}
                                alt={current.alt || name}
                                fill
                                sizes="100vw"
                                draggable={false}
                                className="object-contain pointer-events-none"
                            />
                        </div>
                    </div>

                    {total > 1 && (
                        <>
                            <button type="button" aria-label={labels.prev} onClick={() => go(-1)} className={`${NAV} absolute start-4 top-1/2 -translate-y-1/2`}>
                                <ChevronLeft size={22} aria-hidden="true" className="rtl:rotate-180" />
                            </button>
                            <button type="button" aria-label={labels.next} onClick={() => go(1)} className={`${NAV} absolute end-4 top-1/2 -translate-y-1/2`}>
                                <ChevronRight size={22} aria-hidden="true" className="rtl:rotate-180" />
                            </button>
                            <span dir="ltr" className="absolute bottom-5 rounded-full bg-background/90 px-4 py-1.5 text-sm font-semibold tabular-nums">
                                {index + 1} / {total}
                            </span>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}