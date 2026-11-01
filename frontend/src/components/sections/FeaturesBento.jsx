import Icon from '@/components/ui/Icon';
import Reveal from '@/components/ui/Reveal';
import SectionTitle from '@/components/ui/SectionTitle';
import { planBento } from '@/lib/utils/bento';
import { getT } from '@/lib/serverTexts';
import { getHeadings } from '@/lib/headings';

const arNum = (n) => n.toLocaleString('ar-EG').padStart(2, '٠');

export default async function FeaturesBento({ features }) {
    if (!features || features.length === 0) return null;

    const t = await getT();
    const { eyebrow, title, highlight } = getHeadings(t).features;
    const plan = planBento(features.length);
    const odd = features.length % 2 === 1;

    return (
        <section
            id="features"
            className="relative py-20 overflow-hidden border-y border-border bg-surface sm:py-28"
        >
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-24 start-1/3 h-96 w-96 rounded-full bg-primary/10 blur-[140px]" />
                <div className="absolute -bottom-24 end-1/3 h-96 w-96 rounded-full bg-accent/10 blur-[140px]" />
            </div>

            <div className="relative px-5 mx-auto max-w-7xl sm:px-8">
                <SectionTitle eyebrow={eyebrow} title={title} highlight={highlight} />

                <ul className="grid gap-5 mt-14 sm:grid-cols-2 lg:grid-cols-6 lg:gap-6">
                    {features.map((feature, index) => {
                        const { span, wide } = plan[index];
                        const stretch = odd && index === features.length - 1 ? 'sm:col-span-2' : '';
                        return (
                            <Reveal
                                key={`${feature.title}-${index}`}
                                as="li"
                                delay={(index % 3) * 0.08}
                                className={`flex ${stretch} ${span}`}
                            >
                                <article
                                    className={`group relative flex w-full flex-col justify-between overflow-hidden rounded-theme border p-7 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/15 sm:p-9 ${wide
                                            ? 'border-primary/30 bg-gradient-to-br from-primary/10 via-background to-accent/10 dark:border-primary/25 dark:from-primary/15 dark:via-background dark:to-accent/10'
                                            : 'border-border/80 bg-background/90 hover:border-primary/40 dark:border-white/10 dark:bg-background/70'
                                        }`}
                                >
                                    <span
                                        aria-hidden="true"
                                        className="absolute inset-x-0 top-0 h-1 transition-transform duration-500 ease-out origin-right scale-x-0 pointer-events-none bg-gradient-to-l from-primary via-accent to-secondary group-hover:scale-x-100"
                                    />

                                    <div
                                        aria-hidden="true"
                                        className="absolute transition-all duration-500 rounded-full opacity-0 pointer-events-none -top-20 -start-20 h-52 w-52 bg-gradient-to-br from-primary/20 to-accent/20 blur-3xl group-hover:scale-125 group-hover:opacity-100"
                                    />

                                    <Icon
                                        name={feature.icon}
                                        size={wide ? 190 : 150}
                                        className="pointer-events-none absolute -bottom-10 -end-8 text-primary opacity-[0.05] transition-all duration-700 ease-out group-hover:-rotate-12 group-hover:scale-125 group-hover:opacity-[0.12] dark:opacity-[0.07]"
                                    />

                                    <div className="relative z-10 flex items-center justify-between gap-4 mb-7">
                                        <span className="flex items-center justify-center transition-all duration-500 shadow-lg w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-primary/30 ring-4 ring-primary/10 group-hover:scale-110 group-hover:rotate-3 dark:ring-white/10">
                                            <Icon name={feature.icon} size={26} />
                                        </span>

                                        <span
                                            aria-hidden="true"
                                            className="text-3xl font-black tracking-tight transition-colors duration-500 font-heading text-foreground/10 group-hover:text-primary/30 dark:text-white/10 dark:group-hover:text-primary/40"
                                        >
                                            {arNum(index + 1)}
                                        </span>
                                    </div>

                                    <div className="relative z-10 flex-1">
                                        <h3
                                            className={`font-extrabold text-foreground transition-colors duration-300 group-hover:text-primary ${wide ? 'text-2xl sm:text-3xl' : 'text-xl'
                                                }`}
                                        >
                                            {feature.title}
                                        </h3>
                                        <p
                                            className={`mt-3 leading-relaxed text-muted-foreground transition-colors duration-300 group-hover:text-foreground/90 ${wide ? 'max-w-xl text-base sm:text-lg' : 'text-sm sm:text-base'
                                                }`}
                                        >
                                            {feature.text}
                                        </p>
                                    </div>

                                    <div
                                        aria-hidden="true"
                                        className="relative z-10 flex items-center gap-2 pt-4 border-t mt-7 border-border/50 dark:border-white/5"
                                    >
                                        <span className="h-1.5 w-8 rounded-full bg-primary/40 transition-all duration-500 group-hover:w-16 group-hover:bg-primary" />
                                        <span className="h-1.5 w-2 rounded-full bg-accent/40 transition-all duration-500 group-hover:bg-accent" />
                                    </div>
                                </article>
                            </Reveal>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
}