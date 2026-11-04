'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2, Search } from 'lucide-react';
import ProductCard from '@/components/catalog/ProductCard';
import { useT } from '@/components/providers/TextsProvider';
import api from '@/lib/api/client';

const PAGE_SIZE = 12;
const SORTS = [
    ['order', 'catalog_sortOrder'],
    ['new', 'catalog_sortNew'],
    ['name', 'catalog_sortName']
];

const PAGER =
    'inline-flex h-11 w-11 items-center justify-center rounded-full border border-border transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 disabled:pointer-events-none disabled:opacity-40';

export default function CategoryProducts({ slug, initial }) {
    const t = useT();
    const [items, setItems] = useState(initial.items);
    const [meta, setMeta] = useState(initial.meta);
    const [query, setQuery] = useState('');
    const [sort, setSort] = useState('order');
    const [page, setPage] = useState(1);
    const [state, setState] = useState({ loading: false, error: false });
    const ticket = useRef(0);
    const first = useRef(true);
    const topRef = useRef(null);
    const term = query.trim();

    useEffect(() => {
        if (first.current) {
            first.current = false;
            return undefined;
        }

        ticket.current += 1;
        const current = ticket.current;
        setState({ loading: true, error: false });

        const timer = setTimeout(
            async () => {
                try {
                    const params = { page, limit: PAGE_SIZE, sort };
                    if (term) params.search = term;
                    const res = await api.get(`/public/catalog/categories/${encodeURIComponent(slug)}/products`, { params });
                    if (current !== ticket.current) return;
                    setItems(res.data || []);
                    setMeta(res.meta || null);
                    setState({ loading: false, error: false });
                } catch (error) {
                    if (current === ticket.current) setState({ loading: false, error: true });
                }
            },
            term ? 300 : 0
        );

        return () => clearTimeout(timer);
    }, [slug, term, sort, page]);

    const changeQuery = (value) => {
        setQuery(value);
        setPage(1);
    };

    const changeSort = (value) => {
        setSort(value);
        setPage(1);
    };

    const goTo = (next) => {
        setPage(next);
        if (topRef.current) topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const labels = { view: t('catalog_viewProduct'), featured: t('catalog_featured') };
    const pages = meta ? meta.totalPages : 1;

    return (
        <div ref={topRef} className="scroll-mt-28">
            <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 sm:max-w-sm">
                    <Search
                        size={18}
                        aria-hidden="true"
                        className="absolute -translate-y-1/2 pointer-events-none start-4 top-1/2 text-muted"
                    />
                    <input
                        type="search"
                        dir="auto"
                        autoComplete="off"
                        aria-label={t('catalog_searchLabel')}
                        placeholder={t('catalog_search')}
                        value={query}
                        onChange={(event) => changeQuery(event.target.value)}
                        className="w-full py-3 text-sm transition border rounded-full outline-none border-border bg-surface pe-5 ps-11 placeholder:text-muted/60 focus:border-primary focus:ring-4 focus:ring-primary/15"
                    />
                </div>

                <div className="flex items-center gap-2 text-sm">
                    <label htmlFor="products-sort" className="font-medium text-muted">
                        {t('catalog_sortLabel')}
                    </label>
                    <select
                        id="products-sort"
                        value={sort}
                        onChange={(event) => changeSort(event.target.value)}
                        className="rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                    >
                        {SORTS.map(([id, key]) => (
                            <option key={id} value={id}>
                                {t(key)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div aria-live="polite" aria-busy={state.loading}>
                {state.loading && items.length === 0 ? (
                    <div className="flex justify-center py-16">
                        <Loader2 className="animate-spin text-primary" />
                    </div>
                ) : items.length === 0 ? (
                    <p className="py-16 text-center text-muted">{term ? t('catalog_noResults') : t('catalog_empty')}</p>
                ) : (
                    <ul
                        className={`grid gap-5 transition-opacity sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${state.loading ? 'opacity-60' : ''
                            }`}
                    >
                        {items.map((product) => (
                            <li key={product._id} className="h-full">
                                <ProductCard product={product} labels={labels} />
                            </li>
                        ))}
                    </ul>
                )}
                {state.error && <p role="alert" className="mt-6 text-sm font-medium text-center text-error">{t('request_errGeneric')}</p>}
            </div>

            {pages > 1 && (
                <nav aria-label={t('catalog_page', { page, total: pages })} className="flex items-center justify-center gap-4 mt-10">
                    <button
                        type="button"
                        className={PAGER}
                        disabled={!meta.hasPrevPage || state.loading}
                        aria-label={t('catalog_prev')}
                        onClick={() => goTo(page - 1)}
                    >
                        <ChevronRight size={18} aria-hidden="true" className="rtl:rotate-180" />
                    </button>
                    <span className="text-sm font-semibold tabular-nums">{t('catalog_page', { page, total: pages })}</span>
                    <button
                        type="button"
                        className={PAGER}
                        disabled={!meta.hasNextPage || state.loading}
                        aria-label={t('catalog_next')}
                        onClick={() => goTo(page + 1)}
                    >
                        <ChevronLeft size={18} aria-hidden="true" className="rtl:rotate-180" />
                    </button>
                </nav>
            )}
        </div>
    );
}