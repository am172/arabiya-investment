import Reveal from '@/components/ui/Reveal';
import SectionTitle from '@/components/ui/SectionTitle';

export default function StoryChapters({ data, paragraphs, chapterLabel }) {
    const single = paragraphs.length === 1;

    return (
        <div className="relative px-5 mx-auto max-w-7xl sm:px-8">
            <div aria-hidden="true" className="pointer-events-none absolute -end-24 top-1/2 h-80 w-80 rounded-full bg-accent/10 blur-[130px]" />

            <SectionTitle
                align="center"
                eyebrow={data.eyebrow}
                title={data.title}
                highlight={data.highlight}
            />

            <ol
                className={`relative mx-auto mt-14 grid gap-5 ${single ? 'max-w-2xl' : 'max-w-5xl md:grid-cols-2'
                    }`}
            >
                {paragraphs.map((text, index) => {
                    const lead = index === 0 && !single;
                    return (
                        <Reveal
                            key={`${index}-${text.slice(0, 12)}`}
                            as="li"
                            delay={(index % 3) * 0.08}
                            className={`${lead ? 'md:col-span-2' : ''} ${!lead && index % 2 === 0 ? 'md:mt-10' : ''
                                }`}
                        >
                            <div
                                className={`relative h-full overflow-hidden rounded-theme border p-7 sm:p-9 ${lead
                                        ? 'border-transparent bg-gradient-to-br from-primary to-accent text-primary-foreground'
                                        : 'border-border bg-surface'
                                    }`}
                            >
                                <span
                                    aria-hidden="true"
                                    className={`pointer-events-none absolute -end-1 -top-5 font-heading font-extrabold leading-none ${lead ? 'text-[9rem] opacity-20' : 'text-8xl text-primary/10'
                                        }`}
                                >
                                    {index + 1}
                                </span>
                                <span
                                    className={`relative mb-4 inline-flex rounded-full px-3 py-1 text-xs font-bold ${lead ? 'bg-white/20' : 'bg-primary/10 text-primary'
                                        }`}
                                >
                                    {chapterLabel(index + 1)}
                                </span>
                                <p
                                    className={`relative leading-8 sm:leading-9 ${lead ? 'text-lg font-medium sm:text-xl' : 'text-base text-muted sm:text-lg'
                                        }`}
                                >
                                    {text}
                                </p>
                            </div>
                        </Reveal>
                    );
                })}
            </ol>
        </div>
    );
}