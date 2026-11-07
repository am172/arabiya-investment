'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Building2 } from 'lucide-react';

const sized = (url) => (url && url.includes('/upload/') ? url.replace('/upload/', '/upload/w_600,c_limit,f_auto,q_auto/') : url);

const CARD =
    'group relative flex h-28 w-44 shrink-0 items-center justify-center overflow-hidden rounded-theme bg-white outline-none shadow-sm transition-transform duration-300 ease-out hover:-translate-y-1.5 hover:shadow-md focus-visible:-translate-y-1.5 sm:h-32 sm:w-56';

export default function PartnerCard({ partner, label, hidden = false }) {
    const imgRef = useRef(null);
    const [failed, setFailed] = useState(false);
    const name = (partner.name || '').trim();
    const url = (partner.url || '').trim();
    const external = /^https?:\/\//i.test(url);
    const source = partner.image && partner.image.url ? sized(partner.image.url) : '';

    useEffect(() => {
        const node = imgRef.current;
        if (node && node.complete && node.naturalWidth === 0) setFailed(true);
    }, []);

    const content = (
        <>
            {source && !failed ? (
                <img
                    ref={imgRef}
                    src={source}
                    alt={name}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    onError={() => setFailed(true)}
                    className="object-cover w-full h-full transition-transform duration-300 select-none group-hover:scale-105"
                />
            ) : name ? (
                <span dir="auto" className="px-4 text-base font-bold leading-snug text-center text-slate-700">
                    {name}
                </span>
            ) : (
                <Building2 size={30} aria-hidden="true" className="text-slate-300" />
            )}

            {url && (
                <span
                    aria-hidden="true"
                    className="absolute inset-0 flex items-center justify-center transition duration-300 opacity-0 bg-black/25 group-hover:opacity-100 group-focus-visible:opacity-100"
                >
                    <span className="flex items-center justify-center transition duration-300 scale-75 rounded-full shadow-lg h-11 w-11 bg-primary text-primary-foreground shadow-primary/30 group-hover:scale-100 group-focus-visible:scale-100">
                        <ArrowUpRight size={20} />
                    </span>
                </span>
            )}
        </>
    );

    if (url) {
        return (
            <li>
                <a
                    href={url}
                    {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    aria-label={label}
                    tabIndex={hidden ? -1 : undefined}
                    className={`${CARD} focus-visible:ring-4 focus-visible:ring-primary/40`}
                >
                    {content}
                </a>
            </li>
        );
    }

    return <li className={CARD}>{content}</li>;
}