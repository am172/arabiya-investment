import HeroSplit from './hero/HeroSplit';
import HeroBanner from './hero/HeroBanner';
import HeroFeatures from './hero/HeroFeatures';
import HeroCentered from './hero/HeroCentered';
import HeroAurora from './hero/HeroAurora';
import HeroBento from './hero/HeroBento';
import { arabic } from '@/lib/fonts';

const VARIANTS = {
  split: HeroSplit,
  banner: HeroBanner,
  features: HeroFeatures,
  centered: HeroCentered,
  aurora: HeroAurora,
  bento: HeroBento
};

export default function HeroSection({ hero, stats = [] }) {
  if (!hero || !hero.title) return null;

  const Variant = VARIANTS[hero.variant] || HeroSplit;

  return (
    <div className={`${arabic.variable} font-arabic`}>
      <Variant hero={hero} stats={stats} />
    </div>
  );
}