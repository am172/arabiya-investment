import { FALLBACKS } from '@/content/fallbacks';
import { heroContent } from '@/content/hero';

const VARIANTS = ['split', 'banner', 'features', 'centered', 'aurora', 'bento'];

const list = (source, key, fallback) => (Array.isArray(source[key]) ? source[key] : fallback);

const text = (value, fallback) => (typeof value === 'string' && value.trim() ? value : fallback);

const withUrl = (value, fallback) => (value && value.url ? value : fallback);

const safeHref = (value) => {
  const href = typeof value === 'string' ? value.trim() : '';
  if (!href || href.startsWith('//')) return '';
  if (href.startsWith('/') || href.startsWith('#')) return href;
  try {
    const parsed = new URL(href);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? href : '';
  } catch (error) {
    return '';
  }
};

const resolveCta = (value, fallback) => {
  if (!value || typeof value !== 'object') return fallback;
  const label = typeof value.label === 'string' ? value.label.trim() : '';
  const href = safeHref(value.href);
  return label && href ? { label, href } : fallback;
};

const resolveHero = (hero) => {
  const base = heroContent.fallback;
  const source = hero && typeof hero === 'object' ? hero : null;

  if (!source) return base;

  const overlay = Number(source.bannerOverlay);

  return {
    variant: VARIANTS.includes(source.variant) ? source.variant : base.variant,
    eyebrow: typeof source.eyebrow === 'string' ? source.eyebrow : base.eyebrow,
    title: text(source.title, base.title),
    description: text(source.description, base.description),
    image: withUrl(source.image, base.image),
    bannerImage: withUrl(source.bannerImage, base.bannerImage),
    bannerOverlay: Number.isFinite(overlay) ? Math.min(90, Math.max(0, overlay)) : base.bannerOverlay,
    badges: Array.isArray(source.badges)
      ? source.badges.filter((badge) => badge && badge.text)
      : base.badges,
    primaryCta: resolveCta(source.primaryCta, base.primaryCta),
    secondaryCta: resolveCta(source.secondaryCta, base.secondaryCta)
  };
};

export const resolveContent = (data) => {
  const source = data && typeof data === 'object' ? data : {};
  return {
    hero: resolveHero(source.hero),
    features: list(source, 'features', FALLBACKS.features),
    steps: list(source, 'steps', FALLBACKS.steps),
    subjects: list(source, 'subjects', FALLBACKS.subjects),
    faqs: list(source, 'faqs', FALLBACKS.faqs),
    story: source.story || FALLBACKS.story
  };
};