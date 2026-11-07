export const buildNavigation = (t) => ({
  links: [
    { id: 'home', label: t('nav_home'), href: '/#home' },
    { id: 'products', label: t('nav_products'), href: '/products' },
    { id: 'learn-more', label: t('nav_learnMore'), href: '/learn-more' },
    { id: 'contact', label: t('nav_contact'), href: '/#contact' },
    {
      id: 'subsidiaries',
      label: 'الشركات التابعة',
      href: '/subsidiaries'
    }
  ],
  cta: { label: t('nav_cta'), href: '/#contact' }
});