import { Quote } from 'lucide-react';
import Reveal from '@/components/ui/Reveal';
import SectionTitle from '@/components/ui/SectionTitle';

export default function StoryEditorial({ data, paragraphs }) {
    const [lead, ...rest] = paragraphs;

    return (
        <div className="relative grid gap-10 px-5 mx-auto max-w-7xl sm:px-8 lg:grid-cols-5 lg:gap-16">
            <div aria-hidden="true" className="pointer-events-none absolute -start-28 top-1/3 h-80 w-80 rounded-full bg-primary/10 blur-[130px]" />

            <div className="relative lg:col-span-2">
                <div className="lg:sticky lg:top-28">
                    <SectionTitle
                        align="right"
                        eyebrow={data.eyebrow}
                        title={data.title}
                        highlight={data.highlight}
                    />
                </div>
            </div>

            <div className="relative space-y-8 lg:col-span-3">
                {lead && (
                    <Reveal>
                        <div className="relative overflow-hidden border rounded-theme border-border bg-surface p-7 sm:p-10">
                            <Quote
                                aria-hidden="true"
                                size={64}
                                className="absolute -end-2 -top-2 text-primary/10"
                            />
                            <p className="relative border-s-4 border-primary ps-5 text-xl font-semibold leading-10 sm:text-2xl sm:leading-[2.6rem]">
                                {lead}
                            </p>
                        </div>
                    </Reveal>
                )}
                {rest.map((text, index) => (
                    <Reveal key={`${index}-${text.slice(0, 12)}`} delay={index * 0.06}>
                        <p className="text-base leading-8 text-muted sm:text-lg sm:leading-9">{text}</p>
                    </Reveal>
                ))}
            </div>
        </div>
    );
}