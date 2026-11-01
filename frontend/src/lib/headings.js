const head = (t, prefix) => ({
    eyebrow: t(`${prefix}_eyebrow`),
    title: t(`${prefix}_title`),
    highlight: t(`${prefix}_highlight`),
    description: t(`${prefix}_description`)
});

export const getHeadings = (t) => ({
    stats: head(t, 'stats'),
    categories: head(t, 'categories'),
    featuredProducts: head(t, 'featuredProducts'),
    features: head(t, 'features'),
    industries: head(t, 'industries'),
    steps: head(t, 'steps'),
    subjects: head(t, 'subjects'),
    faq: head(t, 'faq'),
    teachers: head(t, 'teachers'),
    showcase: head(t, 'showcase'),
    testimonials: head(t, 'testimonials'),
    packages: head(t, 'packages'),
    contact: head(t, 'contact'),
    productsHero: head(t, 'productsHero'),
    learnHero: head(t, 'learnHero'),
    aboutHero: head(t, 'aboutHero')
});