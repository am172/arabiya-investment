import FeatureCard from '@/components/cards/FeatureCard';
import Reveal from '@/components/ui/Reveal';
import SectionTitle from '@/components/ui/SectionTitle';
import { getT } from '@/lib/serverTexts';
import { getHeadings } from '@/lib/headings';

const MIN_PER_HALF = 6;
const SECONDS_PER_CARD = 6;

const fillHalf = (items) => {
  const result = [];
  while (result.length < MIN_PER_HALF) {
    items.forEach((item, idx) => {
      result.push({ ...item, _origIndex: idx });
    });
  }
  return result;
};

export default async function FeaturesMarquee({ features }) {
  if (!features || features.length === 0) return null;

  const t = await getT();
  const { eyebrow, title, highlight } = getHeadings(t).features;
  const half = fillHalf(features);
  const duration = Math.max(35, half.length * SECONDS_PER_CARD);

  return (
    <section
      id="features"
      className="relative py-20 overflow-hidden scroll-mt-20 bg-background sm:py-28"
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes nebras-marquee-ltr {
              0% { transform: translate3d(0, 0, 0); }
              100% { transform: translate3d(-50%, 0, 0); }
            }
            .nebras-track-ltr {
              display: flex;
              width: max-content;
              animation: nebras-marquee-ltr var(--marquee-duration, 40s) linear infinite;
            }
            .nebras-marquee-group:hover .nebras-track-ltr {
              animation-play-state: paused;
            }
            @media (prefers-reduced-motion: reduce) {
              .nebras-track-ltr {
                animation: none !important;
              }
            }
          `
        }}
      />

      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute start-1/4 top-1/4 h-96 w-96 rounded-full bg-primary/10 blur-[140px]" />
        <div className="absolute bottom-0 end-1/4 h-96 w-96 rounded-full bg-accent/10 blur-[140px]" />
      </div>

      <div className="relative px-5 mx-auto max-w-7xl sm:px-8">
        <SectionTitle eyebrow={eyebrow} title={title} highlight={highlight} />
      </div>

      <Reveal className="relative mt-14">
        <div
          role="region"
          aria-label={t('features_region')}
          className="nebras-marquee-group relative [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
        >
          <div dir="ltr" className="py-4 overflow-hidden">
            <ul
              className="items-stretch nebras-track-ltr"
              style={{ '--marquee-duration': `${duration}s` }}
            >
              {half.map((feature, position) => (
                <li
                  key={`a-${position}`}
                  dir="rtl"
                  className="flex pr-5 w-72 shrink-0 sm:w-80 sm:pr-6"
                >
                  <FeatureCard feature={feature} index={feature._origIndex} />
                </li>
              ))}
              {half.map((feature, position) => (
                <li
                  key={`b-${position}`}
                  dir="rtl"
                  aria-hidden="true"
                  className="flex pr-5 w-72 shrink-0 sm:w-80 sm:pr-6"
                >
                  <FeatureCard feature={feature} index={feature._origIndex} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>
    </section>
  );
}