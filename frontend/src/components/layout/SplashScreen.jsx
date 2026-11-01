'use client';

import { useEffect, useState } from 'react';

const MIN_MS = 900;
const MAX_MS = 6000;
const KEY = 'splash-seen';

export const SPLASH_SCRIPT = `try{if(sessionStorage.getItem('${KEY}'))document.documentElement.setAttribute('data-splash','seen')}catch(e){}`;

export default function SplashScreen({ siteName = '', logoUrl = '' }) {
    const [phase, setPhase] = useState('show');

    useEffect(() => {
        let done = false;
        let leaveTimer;
        let goneTimer;
        let maxTimer;

        const finish = () => {
            if (done) return;
            done = true;
            clearTimeout(maxTimer);
            leaveTimer = setTimeout(() => {
                setPhase('leaving');
                try {
                    sessionStorage.setItem(KEY, '1');
                } catch (error) {
                    /* storage unavailable */
                }
                goneTimer = setTimeout(() => setPhase('gone'), 500);
            }, Math.max(0, MIN_MS - performance.now()));
        };

        if (document.readyState === 'complete') {
            finish();
        } else {
            window.addEventListener('load', finish, { once: true });
            maxTimer = setTimeout(finish, MAX_MS);
        }

        return () => {
            window.removeEventListener('load', finish);
            clearTimeout(leaveTimer);
            clearTimeout(goneTimer);
            clearTimeout(maxTimer);
        };
    }, []);

    if (phase === 'gone') return null;

    const initial = String(siteName).trim().charAt(0);

    return (
        <>
            <div
                id="app-splash"
                role="status"
                aria-live="polite"
                aria-label={siteName || 'Loading'}
                className={`app-splash ${phase === 'leaving' ? 'app-splash-out' : ''}`}
            >
                <div className="app-splash-glow" aria-hidden="true" />
                <div className="app-splash-stage">
                    <div className="app-splash-mark">
                        {logoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={logoUrl} alt="" decoding="async" className="dark:brightness-0 dark:invert" />
                        ) : (
                            <span>{initial || '•'}</span>
                        )}
                    </div>
                    <div className="app-splash-shadow" aria-hidden="true" />
                </div>
                {siteName && <p className="app-splash-name">{siteName}</p>}
                <div className="app-splash-bar" aria-hidden="true">
                    <span />
                </div>
            </div>
            <noscript>
                <style>{'#app-splash{display:none}'}</style>
            </noscript>
        </>
    );
}