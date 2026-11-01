'use client';

import { useEffect, useRef, useState } from 'react';

export default function MarqueeViewport({ children, className = '', label }) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const element = ref.current;
        if (!element || typeof IntersectionObserver === 'undefined') return undefined;
        const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
            rootMargin: '120px'
        });
        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            role="region"
            aria-label={label}
            data-visible={visible}
            className={`marquee-viewport ${className}`}
        >
            {children}
        </div>
    );
}