import Icon from '@/components/ui/Icon';
import Reveal from '@/components/ui/Reveal';
import SectionTitle from '@/components/ui/SectionTitle';
import { getT } from '@/lib/serverTexts';

export default async function StepsCards({ steps, heading }) {
    if (!steps || steps.length === 0) return null;

    const t = await getT();

    return (
        <section
            id="steps"
            className="relative py-20 overflow-hidden scroll-mt-20 border-y border-border bg-surface sm:py-28"
        >
            <div className="relative px-5 mx-auto max-w-7xl sm:px-8">
                <SectionTitle eyebrow={heading.eyebrow} title={heading.title} highlight={heading.highlight} />

                <ol className="flex flex-col gap-5 mt-14 md:flex-row">
                    {steps.map((step, index) => (
                        <Reveal key={`${step.title}-${index}`} as="li" delay={index * 0.1} className="md:flex-1">
                            <div className="relative h-full overflow-hidden rounded-theme border border-border bg-background p-7 transition duration-300 hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10">
                                <span
                                    aria-hidden="true"
                                    className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-primary to-accent"
                                />
                                <div className="flex items-center justify-between mb-6">
                                    <span className="flex items-center justify-center shadow-lg h-14 w-14 rounded-2xl bg-primary text-primary-foreground shadow-primary/30">
                                        <Icon name={step.icon} size={26} />
                                    </span>
                                    <span className="text-5xl font-extrabold font-heading text-primary/15">
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                </div>
                                <p className="mb-1 text-xs font-semibold text-muted">{t('steps_step', { n: index + 1 })}</p>
                                <h3 className="text-xl font-bold">{step.title}</h3>
                                <p className="mt-2 text-sm leading-7 text-muted sm:text-base">{step.text}</p>
                            </div>
                        </Reveal>
                    ))}
                </ol>
            </div>
        </section>
    );
}