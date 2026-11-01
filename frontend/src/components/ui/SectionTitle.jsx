'use client';

import { useT } from '@/components/providers/TextsProvider';
import Reveal from './Reveal';
import { arabic } from '@/lib/fonts';

export default function SectionTitle({
    eyebrow,
    title,
    highlight,
    description,
    align = 'center',
    className = ''
}) {
    const t = useT();
    const alignment = align === 'center' ? 'mx-auto items-center text-center' : 'items-start text-start';

    return (
        <Reveal className={`flex max-w-2xl flex-col ${alignment} ${className} ${arabic.variable} font-arabic`} dir="rtl">
            {eyebrow && (
                <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary transition-colors dark:border-white/20 dark:bg-white/10 dark:text-white sm:text-base">
                    <span className="h-1.5 w-1.5 rounded-full bg-secondary transition-colors" />
                    {eyebrow}
                </span>
            )}
            <h2 className="text-3xl font-extrabold ![line-height:1.3] sm:![line-height:1.3] transition-colors text-foreground sm:text-4xl lg:text-5xl">
                {title}
                {highlight && (
                    <>
                        {' '}
                        <span className="text-transparent bg-gradient-to-l from-primary via-accent to-primary bg-clip-text dark:from-secondary dark:via-white dark:to-accent">
                            {highlight}
                        </span>
                    </>
                )}
            </h2>
            {description && (
                <p className="mt-4 text-base leading-relaxed transition-colors text-muted-foreground sm:text-lg">
                    {description}
                </p>
            )}
        </Reveal>
    );
}