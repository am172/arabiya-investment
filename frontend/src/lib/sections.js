export const HOME_SECTIONS = [
  'stats',
  'categories',
  'featuredProducts',
  'features',
  'industries',
  'steps',
  'story',
  'showcase',
  'testimonials',
  'partners',
  'branches',
  'faq',
  'contact'
];

export const SECTION_VARIANTS = {
  categories: ['grid', 'tiles', 'showcase'],
  featuredProducts: ['cards', 'carousel', 'spotlight'],
  features: ['marquee', 'bento', 'list'],
  industries: ['grid', 'pills', 'split'],
  steps: ['timeline', 'cards', 'bento'],
  story: ['book', 'editorial', 'chapters'],
  testimonials: ['wall', 'grid', 'spotlight']
};

export const resolveSections = (value) => {
  const seen = new Set();
  const list = [];

  (Array.isArray(value) ? value : []).forEach((item) => {
    if (item && HOME_SECTIONS.includes(item.key) && !seen.has(item.key)) {
      seen.add(item.key);
      const allowed = SECTION_VARIANTS[item.key] || [];
      list.push({
        key: item.key,
        enabled: item.enabled !== false,
        variant: allowed.includes(item.variant) ? item.variant : allowed[0] || ''
      });
    }
  });

  HOME_SECTIONS.forEach((key, index) => {
    if (seen.has(key)) return;
    let at = 0;
    for (let before = index - 1; before >= 0; before -= 1) {
      const position = list.findIndex((item) => item.key === HOME_SECTIONS[before]);
      if (position !== -1) {
        at = position + 1;
        break;
      }
    }
    list.splice(at, 0, { key, enabled: true, variant: (SECTION_VARIANTS[key] || [])[0] || '' });
  });

  return list;
};

export const getHiddenSections = (sections) =>
  sections.filter((item) => !item.enabled).map((item) => item.key);