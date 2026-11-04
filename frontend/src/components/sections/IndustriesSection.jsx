import Icon from '@/components/ui/Icon';
import Reveal from '@/components/ui/Reveal';
import SectionTitle from '@/components/ui/SectionTitle';
import { getT } from '@/lib/serverTexts';
import { getHeadings } from '@/lib/headings';

function Grid({ items }) {
    return (
        <ul className="flex flex-wrap justify-center max-w-5xl gap-4 mx-auto mt-14">
            {items.map((item, index) => (
                <Reveal
                    key={`${item.name}-${index}`}
                    as="li"
                    delay={(index % 6) * 0.06}
                    className="w-[calc(50%-0.5rem)] sm:w-48"
                >
                    <div className="group flex h-full flex-col items-center gap-3 rounded-theme border border-border bg-surface px-4 py-7 text-center transition duration-300 hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10">
                        <span className="flex items-center justify-center w-12 h-12 transition duration-300 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground">
                            <Icon name={item.icon} />
                        </span>
                        <span className="text-sm font-semibold sm:text-base">{item.name}</span>
                    </div>
                </Reveal>
            ))}
        </ul>
    );
}

function Pills({ items }) {
    return (
        <ul className="flex flex-wrap justify-center max-w-4xl gap-3 mx-auto mt-14 sm:gap-4">
            {items.map((item, index) => (
                <Reveal key={`${item.name}-${index}`} as="li" delay={(index % 8) * 0.05}>
                    <span className="inline-flex items-center gap-2.5 rounded-full border border-border bg-surface px-5 py-3 text-sm font-semibold shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary hover:bg-primary hover:text-primary-foreground sm:text-base">
                        <Icon name={item.icon} size={18} />
                        {item.name}
                    </span>
                </Reveal>
            ))}
        </ul>
    );
}

function Rows({ items }) {
    return (
        <ul className="grid gap-3 sm:grid-cols-2 lg:col-span-3">
            {items.map((item, index) => (
                <Reveal key={`${item.name}-${index}`} as="li" delay={(index % 6) * 0.05}>
                    <div className="flex items-center gap-4 p-4 transition border rounded-theme border-border bg-surface hover:border-primary/50 hover:bg-primary/5">
                        <span className="flex items-center justify-center h-11 w-11 shrink-0 rounded-xl bg-primary/10 text-primary">
                            <Icon name={item.icon} size={20} />
                        </span>
                        <span className="font-semibold">{item.name}</span>
                    </div>
                </Reveal>
            ))}
        </ul>
    );
}

export default async function IndustriesSection({ industries, variant = 'grid' }) {
    if (!industries || industries.length === 0) return null;

    const t = await getT();
    const heading = getHeadings(t).industries;

    return (
        <section id="industries" className="relative py-20 overflow-hidden scroll-mt-20 bg-background sm:py-28">
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-grid mask-fade opacity-40 dark:opacity-20" />
                <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-[140px]" />
            </div>

            <div className="relative px-5 mx-auto max-w-7xl sm:px-8">
                {variant === 'split' ? (
                    <div className="grid gap-12 lg:grid-cols-5 lg:gap-14">
                        <div className="lg:col-span-2">
                            <div className="lg:sticky lg:top-28">
                                <SectionTitle align="left" {...heading} />
                            </div>
                        </div>
                        <Rows items={industries} />
                    </div>
                ) : (
                    <>
                        <SectionTitle {...heading} />
                        {variant === 'pills' ? <Pills items={industries} /> : <Grid items={industries} />}
                    </>
                )}
            </div>
        </section>
    );
}