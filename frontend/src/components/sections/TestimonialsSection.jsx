import TestimonialCard from '@/components/cards/TestimonialCard';
import MarqueeViewport from '@/components/ui/MarqueeViewport';
import Reveal from '@/components/ui/Reveal';
import SectionTitle from '@/components/ui/SectionTitle';
import TestimonialSwiper from '@/components/ui/TestimonialSwiper';
import { getT } from '@/lib/serverTexts';
import { getHeadings } from '@/lib/headings';

const MIN_PER_HALF = 4;
const SECONDS_PER_CARD = 8;
const DIRECTIONS = ['up', 'down', 'up'];

const splitColumns = (items, count) =>
  Array.from({ length: count }, (_, column) => items.filter((_, index) => index % count === column));

const fillHalf = (items) => {
  if (items.length === 0) return [];
  const result = [];
  while (result.length < MIN_PER_HALF) result.push(...items);
  return result;
};

function MarqueeColumn({ items, direction, index, starsLabel }) {
  const half = fillHalf(items);
  if (half.length === 0) return null;

  const duration = half.length * (SECONDS_PER_CARD + index * 1.5);

  return (
    <div className="h-full marquee-col scrollbar-hide">
      <ul
        className={`marquee-track ${direction === 'down' ? 'marquee-down' : ''}`}
        style={{ '--marquee-duration': `${duration}s` }}
      >
        {half.map((testimonial, position) => (
          <li key={`a-${testimonial._id}-${position}`} className="pb-5">
            <TestimonialCard testimonial={testimonial} starsLabel={starsLabel} />
          </li>
        ))}
        {half.map((testimonial, position) => (
          <li
            key={`b-${testimonial._id}-${position}`}
            aria-hidden="true"
            className="pb-5 marquee-dup"
          >
            <TestimonialCard testimonial={testimonial} starsLabel={starsLabel} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function MarqueeGrid({ testimonials, columns, className, starsLabel }) {
  const groups = splitColumns(testimonials, columns);

  return (
    <div
      className={`h-full gap-5 ${className}`}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {groups.map((items, index) => (
        <MarqueeColumn
          key={index}
          items={items}
          direction={DIRECTIONS[index]}
          index={index}
          starsLabel={starsLabel}
        />
      ))}
    </div>
  );
}

export default async function TestimonialsSection({ testimonials }) {
  if (!testimonials || testimonials.length === 0) return null;

  const t = await getT();
  const heading = getHeadings(t).testimonials;
  const starsLabel = t('testimonials_stars');

  return (
    <section
      id="testimonials"
      className="relative py-20 overflow-hidden scroll-mt-20 bg-background sm:py-28"
    >
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[150px]" />
        <div className="absolute -end-24 top-10 h-80 w-80 rounded-full bg-accent/10 blur-[130px]" />
      </div>

      <div className="relative px-5 mx-auto max-w-7xl sm:px-8">
        <SectionTitle {...heading} />

        <Reveal className="mt-10 md:hidden">
          <TestimonialSwiper testimonials={testimonials} />
        </Reveal>

        <Reveal className="hidden mt-14 md:block">
          <MarqueeViewport
            label={t('testimonials_region')}
            className="mask-fade-y mx-auto h-[70vh] max-h-[600px] min-h-[28rem] max-w-6xl"
          >
            <MarqueeGrid
              testimonials={testimonials}
              columns={2}
              className="grid lg:hidden"
              starsLabel={starsLabel}
            />
            <MarqueeGrid
              testimonials={testimonials}
              columns={3}
              className="hidden lg:grid"
              starsLabel={starsLabel}
            />
          </MarqueeViewport>
        </Reveal>
      </div>
    </section>
  );
}