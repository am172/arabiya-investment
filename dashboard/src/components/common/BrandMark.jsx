import { GraduationCap } from 'lucide-react';
import { readBrand } from '../../utils/splash';

export default function BrandMark({ size = 48 }) {
  const brand = readBrand();

  if (/^https:\/\//.test(brand.logo || '')) {
    return (
      <img
        src={brand.logo}
        alt=""
        className="block object-contain dark:brightness-0 dark:invert"
        style={{ height: size, maxWidth: size * 3.5 }}
      />
    );
  }

  return (
    <span
      className="flex items-center justify-center text-white rounded-2xl bg-brand-600"
      style={{ width: size, height: size }}
    >
      <GraduationCap size={Math.round(size * 0.5)} />
    </span>
  );
}