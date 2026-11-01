import SectionLink from '@/components/layout/SectionLink';

const VARIANTS = {
  primary:
    'bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40',
  outline:
    'border border-border bg-surface/60 text-foreground backdrop-blur-md hover:border-primary/60 hover:bg-surface',
  ghost: 'text-foreground hover:bg-surface'
};

const SIZES = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base'
};

export default function Button({
  href,
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) {
  const classes = `group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-semibold transition duration-300 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${VARIANTS[variant]} ${SIZES[size]} ${className}`;

  const shine =
    variant === 'primary' ? (
      <span className="absolute inset-0 transition-transform duration-700 -translate-x-full pointer-events-none bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:translate-x-full" />
    ) : null;

  if (href) {
    return (
      <SectionLink href={href} className={classes} {...props}>
        {shine}
        <span className="relative inline-flex items-center gap-2">{children}</span>
      </SectionLink>
    );
  }

  return (
    <button className={classes} {...props}>
      {shine}
      <span className="relative inline-flex items-center gap-2">{children}</span>
    </button>
  );
}