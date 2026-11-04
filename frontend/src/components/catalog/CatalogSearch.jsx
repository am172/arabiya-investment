'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Folder, Loader2, Package, Search, X } from 'lucide-react';
import api from '@/lib/api/client';

const MIN_LENGTH = 2;
const IDLE = { items: [], loading: false, error: false };

const hrefOf = (item) =>
    `${item.kind === 'category' ? '/categories' : '/products'}/${encodeURIComponent(item.slug)}`;

export default function CatalogSearch({ labels, children }) {
    const [query, setQuery] = useState('');
    const [state, setState] = useState(IDLE);
    const counter = useRef(0);
    const term = query.trim();
    const active = term.length >= MIN_LENGTH;

    useEffect(() => {
        counter.current += 1;

        if (!active) {
            setState(IDLE);
            return undefined;
        }

        const ticket = counter.current;
        setState((current) => ({ ...current, loading: true, error: false }));

        const timer = setTimeout(async () => {
            try {
                const res = await api.get('/public/catalog/search', { params: { q: term } });
                if (ticket === counter.current) setState({ items: res.data || [], loading: false, error: false });
            } catch (error) {
                if (ticket === counter.current) setState({ items: [], loading: false, error: true });
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [term, active]);

    return (
        <div>
            <div role="search" className="relative max-w-2xl mx-auto mt-10">
                <label htmlFor="catalog-search" className="sr-only">
                    {labels.aria}
                </label>
                <Search
                    size={20}
                    aria-hidden="true"
                    className="absolute -translate-y-1/2 pointer-events-none start-5 top-1/2 text-muted"
                />
                <input
                    id="catalog-search"
                    type="search"
                    dir="auto"
                    autoComplete="off"
                    value={query}
                    placeholder={labels.placeholder}
                    onChange={(event) => setQuery(event.target.value)}
                    className="w-full rounded-full border border-border bg-surface py-4 pe-14 ps-14 text-base outline-none transition placeholder:text-muted/60 focus:border-primary focus:ring-4 focus:ring-primary/15 [&::-webkit-search-cancel-button]:hidden"
                />
                {query && (
                    <button
                        type="button"
                        aria-label={labels.clear}
                        onClick={() => setQuery('')}
                        className="absolute flex items-center justify-center transition -translate-y-1/2 rounded-full end-3 top-1/2 h-9 w-9 hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            <div className="mt-12" aria-live="polite">
                {!active ? (
                    children
                ) : state.loading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 className="animate-spin text-primary" />
                    </div>
                ) : state.error || state.items.length === 0 ? (
                    <p className="py-16 text-center text-muted">{labels.noResults}</p>
                ) : (
                    <ul className="grid gap-3 md:grid-cols-2">
                        {state.items.map((item) => {
                            const cover = item.cover && item.cover.url;
                            const Icon = item.kind === 'category' ? Folder : Package;
                            return (
                                <li key={item._id}>
                                    <Link
                                        href={hrefOf(item)}
                                        className="flex items-center gap-4 p-3 transition border group rounded-theme border-border bg-surface hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
                                    >
                                        <span className="relative w-16 h-16 overflow-hidden shrink-0 rounded-xl bg-primary/10">
                                            {cover ? (
                                                <Image src={cover} alt="" fill sizes="64px" className="object-cover" />
                                            ) : (
                                                <span className="flex items-center justify-center h-full text-primary/30">
                                                    <Icon size={22} aria-hidden="true" />
                                                </span>
                                            )}
                                        </span>
                                        <span className="flex-1 min-w-0">
                                            <span className="flex items-center gap-2">
                                                <Icon size={14} aria-hidden="true" className="shrink-0 text-primary" />
                                                <span className="font-bold truncate">{item.name}</span>
                                            </span>
                                            {item.path && item.path.length > 0 && (
                                                <span className="mt-0.5 block truncate text-xs text-muted">{item.path.join(' › ')}</span>
                                            )}
                                            {item.summary && (
                                                <span className="block mt-1 text-xs line-clamp-1 text-muted">{item.summary}</span>
                                            )}
                                        </span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}