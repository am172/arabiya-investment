export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isModifiedEvent = (event) =>
  event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;

const readId = (hash) => {
  try {
    return decodeURIComponent(String(hash || '').replace(/^#/, ''));
  } catch (error) {
    return '';
  }
};

export const scrollToHash = (hash, { smooth = false } = {}) => {
  const id = readId(hash);
  if (!id) return false;

  const behavior = smooth && !prefersReducedMotion() ? 'smooth' : 'auto';

  if (id === 'home') {
    window.scrollTo({ top: 0, behavior });
    return true;
  }

  const element = document.getElementById(id);
  if (!element) return false;

  element.scrollIntoView({ behavior, block: 'start' });
  return true;
};

export const isAligned = (hash) => {
  const id = readId(hash);
  if (!id) return true;
  if (id === 'home') return window.scrollY < 2;

  const element = document.getElementById(id);
  if (!element) return false;

  const margin = parseFloat(getComputedStyle(element).scrollMarginTop) || 0;
  return Math.abs(element.getBoundingClientRect().top - margin) < 4;
};