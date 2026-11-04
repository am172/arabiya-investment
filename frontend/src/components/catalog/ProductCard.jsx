import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Package, Star } from 'lucide-react';

const TONES = {
    primary: 'bg-primary/15 text-primary',
    success: 'bg-success/15 text-success',
    warning: 'bg-warning/15 text-warning',
    danger: 'bg-error/15 text-error',
    neutral: 'bg-foreground/10 text-foreground'
};

export const productHref = (product) => `/products/${encodeURIComponent(product.slug)}`;

export function Badges({ items = [], limit = 3, className = '' }) {
    const list = items.slice(0, limit);
    if (list.length === 0) return null;

    return (
        <ul className={`flex flex-wrap gap-1.5 ${className}`}>
            {list.map((badge, index) => (
                <li
                    key={`${badge.text}-${index}`}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold backdrop-blur-sm ${TONES[badge.tone] || TONES.primary}`}
                >
                    {badge.text}
                </li>
            ))}
        </ul>
    );
}

export default function ProductCard({ product, labels, priority = false, className = '' }) {
    const cover = product.cover && product.cover.url;

    return (
        <article
            className={`group relative flex h-full flex-col overflow-hidden rounded-theme border border-border bg-surface transition duration-300 focus-within:ring-2 focus-within:ring-primary hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 ${className}`}
        >
            <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10">
                {cover ? (
                    <Image
                        src={cover}
                        alt=""
                        fill
                        priority={priority}
                        sizes="(min-width: 1280px) 22vw, (min-width: 640px) 45vw, 92vw"
                        className="object-cover transition duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-primary/30">
                        <Package size={48} />
                    </div>
                )}

                <Badges items={product.badges} limit={2} className="absolute start-3 top-3" />

                {product.isFeatured && (
                    <span
                        title={labels.featured}
                        className="absolute flex items-center justify-center w-8 h-8 rounded-full shadow end-3 top-3 bg-background/90 text-warning"
                    >
                        <Star size={15} className="fill-current" />
                        <span className="sr-only">{labels.featured}</span>
                    </span>
                )}
            </div>

            <div className="flex flex-col flex-1 gap-2 p-5">
                {product.sku && (
                    <p dir="ltr" className="text-xs font-medium text-start text-muted">
                        {product.sku}
                    </p>
                )}
                <h3 className="text-lg font-bold leading-snug">
                    <Link
                        href={productHref(product)}
                        className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
                    >
                        {product.name}
                    </Link>
                </h3>
                {product.summary && <p className="text-sm leading-7 line-clamp-2 text-muted">{product.summary}</p>}
                <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-sm font-semibold text-primary">
                    {labels.view}
                    <ArrowRight
                        size={16}
                        aria-hidden="true"
                        className="transition group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1"
                    />
                </span>
            </div>
        </article>
    );
}