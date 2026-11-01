import Reveal from './Reveal';
import SectionTitle from './SectionTitle';
import Icon from './Icon';

export function CardGrid({ eyebrow, title, highlight, items, surface = false, columns = 'lg:grid-cols-3' }) {
    return (
        <section className={`relative overflow-hidden py-16 sm:py-24 ${surface ? 'border-y border-border bg-surface' : 'bg-background'}`}>
            <div className="px-5 mx-auto max-w-7xl sm:px-8">
                <SectionTitle eyebrow={eyebrow} title={title} highlight={highlight} />
                <ul className={`mt-14 grid gap-5 sm:grid-cols-2 ${columns}`}>
                    {items.map((item, index) => (
                        <Reveal key={item.title} as="li" delay={(index % 3) * 0.1}>
                            <div className="group h-full rounded-theme border border-border bg-background/70 p-7 backdrop-blur-xl transition duration-500 hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/15">
                                <span className="flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-primary/30">
                                    <Icon name={item.icon} />
                                </span>
                                <h3 className="text-lg font-bold">{item.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-muted">{item.text}</p>
                            </div>
                        </Reveal>
                    ))}
                </ul>
            </div>
        </section>
    );
}

export function ProcessSteps({ eyebrow, title, highlight, items }) {
    return (
        <section className="relative py-16 overflow-hidden bg-background sm:py-24">
            <div className="px-5 mx-auto max-w-7xl sm:px-8">
                <SectionTitle eyebrow={eyebrow} title={title} highlight={highlight} />
                <ol className="grid gap-8 mt-14 md:grid-cols-3">
                    {items.map((step, index) => (
                        <Reveal key={step.title} as="li" delay={index * 0.12}>
                            <div className="relative h-full p-8 border rounded-theme border-border bg-surface">
                                <span className="absolute flex items-center justify-center w-10 h-10 text-lg font-bold rounded-full shadow-lg -top-5 left-8 bg-primary font-heading text-primary-foreground shadow-primary/30">
                                    {index + 1}
                                </span>
                                <span className="flex items-center justify-center w-12 h-12 mt-3 mb-5 rounded-2xl bg-primary/10 text-primary">
                                    <Icon name={step.icon} />
                                </span>
                                <h3 className="text-xl font-bold">{step.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-muted">{step.text}</p>
                            </div>
                        </Reveal>
                    ))}
                </ol>
            </div>
        </section>
    );
}

export function SubjectChips({ eyebrow, title, highlight, items }) {
    return (
        <section className="relative py-16 overflow-hidden border-y border-border bg-surface sm:py-24">
            <div className="max-w-5xl px-5 mx-auto sm:px-8">
                <SectionTitle eyebrow={eyebrow} title={title} highlight={highlight} />
                <ul className="flex flex-wrap justify-center gap-3 mt-12 sm:gap-4">
                    {items.map((subject, index) => (
                        <Reveal key={subject.name} as="li" delay={index * 0.06}>
                            <span className="inline-flex items-center gap-2.5 rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary hover:text-primary hover:shadow-lg hover:shadow-primary/10 sm:text-base">
                                <Icon name={subject.icon} size={18} className="text-primary" />
                                {subject.name}
                            </span>
                        </Reveal>
                    ))}
                </ul>
            </div>
        </section>
    );
}