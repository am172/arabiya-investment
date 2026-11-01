import StatCard from '@/components/cards/StatCard';
import SectionTitle from '@/components/ui/SectionTitle';
import { getT } from '@/lib/serverTexts';
import { getHeadings } from '@/lib/headings';

const COLUMNS = {
  1: 'max-w-sm',
  2: 'lg:grid-cols-2 max-w-3xl',
  3: 'lg:grid-cols-3 max-w-5xl',
  4: 'lg:grid-cols-4 max-w-7xl'
};

export default async function StatsSection({ stats }) {
  if (!stats || stats.length === 0) return null;

  const t = await getT();
  const heading = getHeadings(t).stats;
  const columns = COLUMNS[Math.min(stats.length, 4)] || COLUMNS[4];

  return (
    <section
      id="stats"
      className="relative py-20 overflow-hidden scroll-mt-20 border-y border-border bg-surface sm:py-28"
    >
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute start-1/4 top-0 h-72 w-72 rounded-full bg-primary/10 blur-[110px]" />
        <div className="absolute bottom-0 end-1/4 h-72 w-72 rounded-full bg-accent/10 blur-[110px]" />
      </div>

      <div className="relative px-5 mx-auto max-w-7xl sm:px-8">
        <SectionTitle {...heading} />

        <div className={`mx-auto mt-14 grid grid-cols-2 gap-4 sm:gap-6 ${columns}`}>
          {stats.map((stat, index) => (
            <StatCard key={stat._id} stat={stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}