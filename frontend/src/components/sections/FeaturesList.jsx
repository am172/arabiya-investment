import Icon from '@/components/ui/Icon';
import Reveal from '@/components/ui/Reveal';
import SectionTitle from '@/components/ui/SectionTitle';
import { getT } from '@/lib/serverTexts';
import { getHeadings } from '@/lib/headings';

export default async function FeaturesList({ features }) {
    if (!features || features.length === 0) return null;

    const t = await getT();
    const heading = getHeadings(t).features;

    return (
        <section id="features" className="relative py-20 overflow-hidden scroll-mt-20 bg-background sm:py-28">
            <div className="grid gap-12 px-5 mx-auto max-w-7xl sm:px-8 lg:grid-cols-5 lg:gap-16">
                <div className="lg:col-span-2">
                    <div className="lg:sticky lg:top-28">
                        <SectionTitle align="left" {...heading} />
                    </div>
                </div>

                <ol className="lg:col-span-3">
                    {features.map((feature, index) => (
                        <Reveal key={`${feature.title}-${index}`} as="li" delay={(index % 4) * 0.06}>
                            <div className="flex gap-5 border-b group border-border py-7 first:pt-0 last:border-b-0 sm:gap-7">
                                <span className="text-4xl font-extrabold leading-none transition font-heading text-primary/25 group-hover:text-primary sm:text-5xl">
                                    {String(index + 1).padStart(2, '0')}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="flex items-center justify-center w-10 h-10 shrink-0 rounded-xl bg-primary/10 text-primary">
                                            <Icon name={feature.icon} size={20} />
                                        </span>
                                        <h3 className="text-xl font-bold">{feature.title}</h3>
                                    </div>
                                    <p className="text-sm leading-7 text-muted sm:text-base">{feature.text}</p>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </ol>
            </div>
        </section>
    );
}