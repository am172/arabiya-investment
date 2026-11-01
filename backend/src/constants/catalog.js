module.exports = Object.freeze({
  KINDS: ['category', 'product'],
  OPTION_TYPES: ['select', 'radio', 'checkbox', 'number', 'text', 'textarea'],
  CHOICE_TYPES: ['select', 'radio', 'checkbox'],
  REQUEST_STATUSES: ['new', 'contacted', 'quoted', 'completed', 'cancelled'],
  BADGE_TONES: ['primary', 'success', 'warning', 'danger', 'neutral'],
  MAX_DEPTH: 50,
  MAX_DUPLICATE_NODES: 300,
  LIMITS: {
    gallery: 30,
    badges: 8,
    features: 40,
    specs: 100,
    documents: 15,
    options: 40,
    values: 100,
    tags: 20,
    items: 10
  }
});