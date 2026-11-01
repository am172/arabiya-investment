import PackageCard from '@/components/cards/PackageCard';
import { PackageMinimal, PackageRow } from '@/components/cards/PackageVariants';
import Reveal from '@/components/ui/Reveal';
import SectionTitle from '@/components/ui/SectionTitle';
import { getT } from '@/lib/serverTexts';
import { getHeadings } from '@/lib/headings';

const LAYOUTS = {
  1: 'max-w-md',
  2: 'max-w-4xl md:grid-cols-2',
  3: 'max-w-6xl md:grid-cols-2 lg:grid-cols-3',
  4: 'max-w-7xl md:grid-cols-2 xl:grid-cols-4'
};

export default async function PackagesSection({ packages, variant = 'cards' }) {
  if (!packages || packages.length === 0) return null;

  const t = await getT();
  const heading = getHeadings(t).packages;
  const layout = LAYOUTS[Math.min(packages.length, 4)] || LAYOUTS[4];

  return (
    <section id="packages" className="relative py-20 overflow-hidden scroll-mt-20 bg-background sm:py-28">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/2 top-1/3 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[150px]" />
        <div className="absolute inset-0 bg-grid mask-fade opacity-40 dark:opacity-20" />
      </div>

      <div className="relative px-5 mx-auto max-w-7xl sm:px-8">
        <SectionTitle {...heading} />

        {variant === 'rows' ? (
          <div className="flex flex-col max-w-5xl gap-4 mx-auto mt-14">
            {packages.map((pkg, index) => (
              <Reveal key={pkg._id} delay={index * 0.08}>
                <PackageRow pkg={pkg} />
              </Reveal>
            ))}
          </div>
        ) : (
          <div
            className={`mx-auto mt-16 grid items-stretch ${
              variant === 'minimal' ? 'gap-5' : 'gap-8'
            } ${layout}`}
          >
            {packages.map((pkg, index) => (
              <Reveal
                key={pkg._id}
                delay={index * 0.12}
                className={variant === 'cards' && pkg.isPopular ? 'relative z-10 lg:-my-4' : ''}
              >
                {variant === 'minimal' ? <PackageMinimal pkg={pkg} /> : <PackageCard pkg={pkg} />}
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}