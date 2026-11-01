import Icon from '@/components/ui/Icon';
import Reveal from '@/components/ui/Reveal';
import SectionTitle from '@/components/ui/SectionTitle';

export default function StepsBento({ steps, heading }) {
    if (!steps || steps.length === 0) return null;

    const rest = steps.length > 3 ? 'lg:col-span-2' : 'lg:col-span-3';

    return (
        <section
            id="steps"
            className="relative py-20 overflow-hidden scroll-mt-20 border-y border-border bg-surface sm:py-28"
        >
            <div className="relative px-5 mx-auto max-w-7xl sm:px-8">
                <SectionTitle eyebrow={heading.eyebrow} title={heading.title} highlight={heading.highlight} />

                <ol className="grid gap-4 mt-14 sm:grid-cols-2 lg:grid-cols-6 lg:gap-5">
                    {steps.map((step, index) => {
                        const lead = index === 0 && steps.length > 1;
                        return (
                            <Reveal
                                key={`${step.title}-${index}`}
                                as="li"
                                delay={(index % 3) * 0.08}
                                className={`flex ${lead ? 'sm:col-span-2 lg:col-span-3 lg:row-span-2' : rest}`}
                            >
                                <div
                                    className={`relative flex w-full flex-col justify-between overflow-hidden rounded-theme border p-7 sm:p-8 ${lead
                                            ? 'border-transparent bg-gradient-to-br from-primary to-accent text-primary-foreground'
                                            : 'border-border bg-background'
                                        }`}
                                >
                                    <span
                                        aria-hidden="true"
                                        className={`pointer-events-none absolute -end-2 -top-4 font-heading font-extrabold leading-none ${lead ? 'text-[9rem] opacity-20' : 'text-8xl text-primary/10'
                                            }`}
                                    >
                                        {index + 1}
                                    </span>
                                    <span
                                        className={`relative mb-10 flex h-12 w-12 items-center justify-center rounded-2xl ${lead ? 'bg-white/20' : 'bg-primary/10 text-primary'
                                            }`}
                                    >
                                        <Icon name={step.icon} />
                                    </span>
                                    <div className="relative">
                                        <h3 className={`font-bold ${lead ? 'text-2xl sm:text-3xl' : 'text-xl'}`}>{step.title}</h3>
                                        <p
                                            className={`mt-2 text-sm leading-7 sm:text-base ${lead ? 'opacity-90' : 'text-muted'
                                                }`}
                                        >
                                            {step.text}
                                        </p>
                                    </div>
                                </div>
                            </Reveal>
                        );
                    })}
                </ol>
            </div>
        </section>
    );
}