import { useCallback, useEffect, useState } from 'react';

const KEY = 'dashboard_theme';
const EVENT = 'dashboard-theme';
const read = () => document.documentElement.classList.contains('dark');

export default function useDashboardTheme() {
    const [dark, setDark] = useState(read);

    useEffect(() => {
        const sync = () => setDark(read());
        window.addEventListener(EVENT, sync);
        return () => window.removeEventListener(EVENT, sync);
    }, []);

    const toggle = useCallback(() => {
        const next = !read();
        document.documentElement.classList.toggle('dark', next);
        try {
            localStorage.setItem(KEY, next ? 'dark' : 'light');
        } catch (error) {
            window.dispatchEvent(new Event(EVENT));
            return;
        }
        window.dispatchEvent(new Event(EVENT));
    }, []);

    return { dark, toggle };
}