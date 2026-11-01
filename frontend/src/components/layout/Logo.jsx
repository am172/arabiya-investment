import Image from 'next/image';
import { GraduationCap } from 'lucide-react';
import SectionLink from './SectionLink';

export default function Logo({
  siteName,
  logo,
  className = '',
  imageClassName = 'h-9',
  iconClassName = 'h-9 w-9',
  textClassName = 'text-lg',
  keepColors = false
}) {
  const hasLogo = Boolean(logo && logo.url);

  return (
    <SectionLink
      href="/#home"
      aria-label={siteName}
      className={`inline-flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 ${className}`}
    >
      {hasLogo ? (
        <Image
          src={logo.url}
          alt={siteName}
          width={240}
          height={80}
          unoptimized
          priority
          className={`w-auto object-contain ${
            keepColors ? '' : 'dark:brightness-0 dark:invert'
          } ${imageClassName}`}
        />
      ) : (
        <>
          <span
            className={`flex items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 ring-1 ring-foreground/10 ${iconClassName}`}
          >
            <GraduationCap size={22} />
          </span>
          <span className={`font-heading font-bold text-foreground ${textClassName}`}>
            {siteName}
          </span>
        </>
      )}
    </SectionLink>
  );
}