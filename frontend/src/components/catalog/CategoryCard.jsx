import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Folder } from 'lucide-react';

export const categoryHref = (category) => `/categories/${encodeURIComponent(category.slug)}`;

const imageOf = (category) =>
    (category.cover && category.cover.url) || (category.banner && category.banner.url) || '';

function Arrow() {
    return (
        <ArrowRight
            size={16}
            aria-hidden="true"
            className="transition group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1"
        />
    );
}

export default function CategoryCard({
    category,
    labels,
    meta = '',
    variant = 'card',
    size = 'md',
    priority = false,
    className = ''
}) {
    const image = imageOf(category);

    if (variant === 'bento') {
        return (
            <article
                className={`group relative isolate flex h-full w-full min-h-[13rem] overflow-hidden rounded-theme bg-gradient-to-br from-primary to-accent focus-within:ring-2 focus-within:ring-primary lg:min-h-0 ${className}`}
            >
                {image ? (
                    <Image
                        src={image}
                        alt=""
                        fill
                        priority={priority}
                        sizes="(min-width: 1024px) 55vw, 95vw"
                        className="object-cover transition duration-700 -z-10 group-hover:scale-105"
                    />
                ) : (
                    <Folder aria-hidden="true" size={96} className="absolute end-6 top-6 -z-10 text-white/20" />
                )}
                <div
                    aria-hidden="true"
                    className="absolute inset-0 -z-10 bg-black/30 transition duration-500 group-hover:bg-black/70 group-focus-within:bg-black/70 [@media(hover:none)]:bg-black/60"
                />

                <div className="flex flex-col justify-center w-full gap-2 p-5 text-white sm:p-7">
                    <h3
                        className={`font-medium leading-snug ${size === 'sm' ? 'text-xl sm:text-2xl' : 'text-xl sm:text-2xl lg:text-3xl'
                            }`}
                    >
                        <Link
                            href={categoryHref(category)}
                            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
                        >
                            {category.name}
                        </Link>
                    </h3>

                    <div className="grid transition-all duration-500 opacity-0 grid-rows-[0fr] group-hover:grid-rows-[1fr] group-hover:opacity-100 group-focus-within:grid-rows-[1fr] group-focus-within:opacity-100 [@media(hover:none)]:grid-rows-[1fr] [@media(hover:none)]:opacity-100">
                        <div className="flex flex-col items-start gap-2 overflow-hidden">
                            {meta && (
                                <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-white/20 backdrop-blur-sm">
                                    {meta}
                                </span>
                            )}
                            {size !== 'sm' && category.summary && (
                                <p className="max-w-md text-sm leading-6 line-clamp-2 text-white/80">{category.summary}</p>
                            )}
                            <Link
                                href={categoryHref(category)}
                                className="relative z-10 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white transition rounded-full cursor-pointer border border-white/30 bg-white/15 backdrop-blur-md hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                            >
                                {labels.view}
                                <Arrow />
                            </Link>
                        </div>
                    </div>
                </div>
            </article>
        );
    }

    if (variant === 'tile') {
        return (
            <article
                className={`group relative isolate flex overflow-hidden rounded-theme bg-gradient-to-br from-primary to-accent focus-within:ring-2 focus-within:ring-primary ${size === 'lg' ? 'min-h-[22rem] sm:min-h-[28rem]' : 'min-h-[14rem] sm:min-h-[16rem]'
                    } ${className}`}
            >
                {image ? (
                    <Image
                        src={image}
                        alt=""
                        fill
                        priority={priority}
                        sizes={size === 'lg' ? '(min-width: 1024px) 55vw, 95vw' : '(min-width: 1024px) 28vw, 95vw'}
                        className="object-cover transition duration-700 -z-10 group-hover:scale-105"
                    />
                ) : (
                    <Folder aria-hidden="true" size={96} className="absolute end-6 top-6 -z-10 text-white/20" />
                )}
                <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/35 to-black/5" />

                <div className="w-full p-5 mt-auto text-white sm:p-7">
                    {meta && (
                        <span className="inline-flex px-3 py-1 mb-3 text-xs font-semibold rounded-full bg-white/20 backdrop-blur-sm">
                            {meta}
                        </span>
                    )}
                    <h3 className={`font-bold leading-snug ${size === 'lg' ? 'text-2xl sm:text-4xl' : 'text-xl'}`}>
                        <Link
                            href={categoryHref(category)}
                            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
                        >
                            {category.name}
                        </Link>
                    </h3>
                    {size === 'lg' && category.summary && (
                        <p className="max-w-xl mt-2 text-sm leading-7 line-clamp-2 text-white/80 sm:text-base">{category.summary}</p>
                    )}
                    <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold">
                        {labels.view}
                        <Arrow />
                    </span>
                </div>
            </article>
        );
    }

    return (
        <article
            className={`group relative flex h-full flex-col overflow-hidden rounded-theme border border-border bg-surface transition duration-300 focus-within:ring-2 focus-within:ring-primary hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 ${className}`}
        >
            <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-primary/15 to-accent/10">
                {image ? (
                    <Image
                        src={image}
                        alt=""
                        fill
                        priority={priority}
                        sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
                        className="object-cover transition duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-primary/30">
                        <Folder size={52} />
                    </div>
                )}
            </div>

            <div className="flex flex-col flex-1 gap-2 p-5">
                <h3 className="text-xl font-bold leading-snug">
                    <Link
                        href={categoryHref(category)}
                        className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
                    >
                        {category.name}
                    </Link>
                </h3>
                {category.summary && <p className="text-sm leading-7 line-clamp-2 text-muted">{category.summary}</p>}
                <div className="flex items-center justify-between gap-3 pt-3 mt-auto">
                    {meta ? (
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary">{meta}</span>
                    ) : (
                        <span />
                    )}
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                        {labels.view}
                        <Arrow />
                    </span>
                </div>
            </div>
        </article>
    );
}