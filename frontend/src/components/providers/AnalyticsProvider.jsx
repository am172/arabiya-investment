'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { bindListeners, endView, startView } from '@/lib/analytics/tracker';

export default function AnalyticsProvider() {
    const pathname = usePathname();

    useEffect(() => bindListeners(), []);

    useEffect(() => {
        const timer = setTimeout(() => startView({ path: pathname, title: document.title }), 150);
        return () => {
            clearTimeout(timer);
            endView();
        };
    }, [pathname]);

    return null;
}