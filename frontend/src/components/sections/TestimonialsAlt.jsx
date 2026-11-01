import TestimonialCard from '@/components/cards/TestimonialCard';
import Reveal from '@/components/ui/Reveal';
import SectionTitle from '@/components/ui/SectionTitle';
import TestimonialSpotlight from './TestimonialSpotlight';
import { getT } from '@/lib/serverTexts';
import { getHeadings } from '@/lib/headings';

export default async function TestimonialsAlt({ testimonials, variant }) {
    if (!testimonials || testimonials.length === 0) return null;

    const t = await getT();
    const heading = getHeadings(t).testimonials;
    const starsLabel = t('testimonials_stars');

    return (
        <section id="testimonials" className="relative py-20 overflow-hidden scroll-mt-20 bg-background sm:py-28">
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
                <div className="absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[150px]" />
            </div>

            <div className="relative px-5 mx-auto max-w-7xl sm:px-8">
                <SectionTitle {...heading} />

                {variant === 'spotlight' ? (
                    <TestimonialSpotlight testimonials={testimonials} starsLabel={starsLabel} />
                ) : (
                    <div className="gap-5 mt-14 md:columns-2 lg:columns-3">
                        {testimonials.slice(0, 9).map((testimonial, index) => (
                            <Reveal key={testimonial._id} delay={(index % 3) * 0.08} className="mb-5 break-inside-avoid">
                                <TestimonialCard testimonial={testimonial} starsLabel={starsLabel} />
                            </Reveal>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}