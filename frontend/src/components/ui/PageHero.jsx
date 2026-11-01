'use client';

import { useT } from '@/components/providers/TextsProvider';
import SectionTitle from './SectionTitle';
import { arabic } from '@/lib/fonts';

export default function PageHero({ eyebrow, title, highlight, description }) {
    const t = useT();
    
    return (
        <section dir="rtl" lang="ar" className={`${arabic.variable} font-arabic relative pt-32 pb-16 overflow-hidden border-b isolate border-border bg-background sm:pb-20 sm:pt-40 dark:border-white/10`}>
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none -z-10">
                <div className="absolute -start-32 top-0 h-96 w-96 rounded-full bg-primary/20 blur-[130px] dark:bg-primary/10" />
                <div className="absolute -end-32 bottom-0 h-96 w-96 rounded-full bg-accent/20 blur-[130px] dark:bg-accent/10" />
                <div className="absolute inset-0 opacity-50 bg-grid mask-fade dark:opacity-25" />
            </div>
            <div className="px-5 mx-auto max-w-7xl sm:px-8">
                <SectionTitle
                    eyebrow={eyebrow}
                    title={title}
                    highlight={highlight}
                    description={description}
                />
            </div>
        </section>
    );
}