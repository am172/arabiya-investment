const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
const ENDPOINT = `${API_URL}/analytics/track`;
const SESSION_KEY = 'nebras-sid';
const ENTRY_KEY = 'nebras-entry';
const CONTENT_TYPE = 'text/plain;charset=UTF-8';

let view = null;
let entry = null;
let memorySession = '';

const randomId = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
};

const isVisible = () => document.visibilityState === 'visible';

const isEnabled = () => {
    if (typeof window === 'undefined') return false;
    const nav = window.navigator;
    if (nav.doNotTrack === '1' || window.doNotTrack === '1') return false;
    if (nav.globalPrivacyControl) return false;
    return true;
};

const getSessionId = () => {
    try {
        let id = sessionStorage.getItem(SESSION_KEY);
        if (!id) {
            id = randomId();
            sessionStorage.setItem(SESSION_KEY, id);
        }
        return id;
    } catch (error) {
        if (!memorySession) memorySession = randomId();
        return memorySession;
    }
};

const getEntry = () => {
    if (entry) return entry;

    try {
        const stored = sessionStorage.getItem(ENTRY_KEY);
        if (stored) {
            entry = JSON.parse(stored);
            return entry;
        }
    } catch (error) {
        entry = null;
    }

    const params = new URLSearchParams(window.location.search);
    entry = {
        referrer: (document.referrer || '').slice(0, 500),
        utm: {
            source: (params.get('utm_source') || '').slice(0, 60),
            medium: (params.get('utm_medium') || '').slice(0, 60),
            campaign: (params.get('utm_campaign') || '').slice(0, 100)
        }
    };

    try {
        sessionStorage.setItem(ENTRY_KEY, JSON.stringify(entry));
    } catch (error) {
        return entry;
    }

    return entry;
};

const send = (payload) => {
    const body = JSON.stringify({ ...payload, sessionId: getSessionId() });

    try {
        if (typeof navigator.sendBeacon === 'function') {
            const blob = new Blob([body], { type: CONTENT_TYPE });
            if (navigator.sendBeacon(ENDPOINT, blob)) return;
        }
    } catch (error) {
        return;
    }

    try {
        fetch(ENDPOINT, {
            method: 'POST',
            body,
            headers: { 'Content-Type': CONTENT_TYPE },
            keepalive: true,
            credentials: 'omit',
            mode: 'cors'
        }).catch(() => { });
    } catch (error) {
        return;
    }
};

const pause = () => {
    if (!view || !view.visibleSince) return;
    view.accumulated += Date.now() - view.visibleSince;
    view.visibleSince = null;
};

const resume = () => {
    if (!view || view.visibleSince) return;
    view.visibleSince = Date.now();
};

const report = () => {
    if (!view) return;
    const live = view.visibleSince ? Date.now() - view.visibleSince : 0;
    const seconds = Math.round((view.accumulated + live) / 1000);
    if (seconds < 1 || seconds === view.reported) return;
    view.reported = seconds;
    send({ type: 'duration', viewId: view.id, duration: seconds });
};

export const endView = () => {
    if (!view) return;
    pause();
    report();
    view = null;
};

export const startView = ({ path, title }) => {
    if (!isEnabled()) return;
    endView();

    const { referrer, utm } = getEntry();
    view = {
        id: randomId(),
        accumulated: 0,
        visibleSince: isVisible() ? Date.now() : null,
        reported: 0
    };

    send({
        type: 'pageview',
        viewId: view.id,
        path,
        title: String(title || '').slice(0, 150),
        referrer,
        utm
    });
};

export const trackEvent = (eventName, label = '') => {
    if (!isEnabled()) return;
    send({
        type: 'event',
        eventName,
        eventLabel: String(label || '').slice(0, 100),
        path: window.location.pathname
    });
};

export const trackCta = (label) => trackEvent('CTA_CLICK', label);

export const bindListeners = () => {
    const onVisibility = () => {
        if (isVisible()) {
            resume();
            return;
        }
        pause();
        report();
    };

    const onHide = () => {
        pause();
        report();
    };

    const onClick = (event) => {
        const source = event.target instanceof Element ? event.target.closest('[data-track]') : null;
        if (!source) return;
        trackEvent(source.getAttribute('data-track-event') || 'CTA_CLICK', source.getAttribute('data-track') || '');
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onHide);
    document.addEventListener('click', onClick, true);

    return () => {
        document.removeEventListener('visibilitychange', onVisibility);
        window.removeEventListener('pagehide', onHide);
        document.removeEventListener('click', onClick, true);
    };
};