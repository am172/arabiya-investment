module.exports = Object.freeze({
  hero: {
    variant: 'split',
    eyebrow: 'العربية للاستثمار',
    title: 'الجبس والمواد الصناعية\nبمعايير جودة موثوقة',
    description:
      'نوفر منتجات الجبس والمواد الصناعية للمصانع والمقاولين وشركات البناء بمواصفات واضحة وتوريد منتظم وخيارات تعبئة مرنة.',
    image: { url: '', publicId: '' },
    bannerImage: { url: '', publicId: '' },
    bannerOverlay: 55,
    badges: [
      { icon: 'shield-check', text: 'مواصفات موثقة' },
      { icon: 'award', text: 'جودة ثابتة' },
      { icon: 'clock', text: 'التزام بالتوريد' }
    ],
    primaryCta: { label: 'اطلب عرض سعر', href: '/#contact' },
    secondaryCta: { label: 'تصفح المنتجات', href: '/products' },
    slides: [],
    slider: { autoplay: true, interval: 6, effect: 'fade', showArrows: true, showDots: true }
  },
  sections: [
    { key: 'stats', enabled: true, variant: '' },
    { key: 'categories', enabled: true, variant: 'grid' },
    { key: 'featuredProducts', enabled: true, variant: 'cards' },
    { key: 'features', enabled: true, variant: 'bento' },
    { key: 'industries', enabled: true, variant: 'grid' },
    { key: 'steps', enabled: true, variant: 'timeline' },
    { key: 'story', enabled: true, variant: 'book' },
    { key: 'showcase', enabled: false, variant: '' },
    { key: 'testimonials', enabled: false, variant: 'wall' },
    { key: 'partners', enabled: true, variant: '' },
    { key: 'branches', enabled: true, variant: '' },
    { key: 'faq', enabled: true, variant: '' },
    { key: 'contact', enabled: true, variant: '' }
  ],
  features: [
    { icon: 'shield-check', title: 'جودة تحت الرقابة', text: 'نراجع كل دفعة قبل التوريد لنضمن مطابقتها للمواصفات المتفق عليها.' },
    { icon: 'award', title: 'مواصفات واضحة', text: 'نوفر المواصفات الفنية لكل منتج لتختار ما يناسب استخدامك بدقة.' },
    { icon: 'clock', title: 'التزام بالمواعيد', text: 'نخطط التوريد مسبقًا لنقلل التأخير على خطوط إنتاجك ومواقعك.' },
    { icon: 'layers', title: 'خيارات تعبئة مرنة', text: 'عبوات بأحجام مختلفة أو توريد صب بالطن بحسب احتياجك.' },
    { icon: 'users', title: 'فريق مبيعات متخصص', text: 'نرد على استفساراتك الفنية ونجهز عرض السعر بسرعة.' },
    { icon: 'globe', title: 'ترتيب التوريد لموقعك', text: 'نتفق معك على خطة الشحن والموعد المناسبين لموقعك.' }
  ],
  steps: [
    { icon: 'layers', title: 'تصفح المنتجات', text: 'اختر الفئة والمنتج المناسب من الكتالوج.' },
    { icon: 'target', title: 'حدد الخيارات', text: 'اختر وزن العبوة وطريقة التغليف والكمية وموقع التوريد.' },
    { icon: 'rocket', title: 'أرسل طلبك', text: 'يصل طلبك فورًا إلى فريق المبيعات بكل تفاصيله.' },
    { icon: 'users', title: 'نتواصل بعرض السعر', text: 'نراجع الطلب معك ونرسل عرض السعر وخطة التوريد.' }
  ],
  subjects: [
    { icon: 'layers', name: 'مصانع الأسمنت' },
    { icon: 'briefcase', name: 'المقاولات والبناء' },
    { icon: 'sparkles', name: 'صناعة السيراميك والخزف' },
    { icon: 'star', name: 'التشطيبات والديكور' }
  ],
  faqs: [
    {
      question: 'كيف أطلب عرض سعر؟',
      answer: 'افتح صفحة المنتج واضغط «طلب منتج»، ثم حدد الخيارات المطلوبة وأرسل بياناتك. سنتواصل معك بعرض السعر.'
    },
    {
      question: 'هل يمكنني تحديد التغليف والكمية؟',
      answer: 'نعم. تظهر في نموذج الطلب خيارات خاصة بكل منتج مثل وزن العبوة وطريقة التغليف والكمية.'
    },
    {
      question: 'ما أقل كمية يمكن طلبها؟',
      answer: 'تختلف حسب المنتج، وتظهر في خيارات الطلب أو نؤكدها معك عند مراجعة الطلب.'
    },
    {
      question: 'هل تتوفر بيانات فنية للمنتجات؟',
      answer: 'تتوفر المواصفات الفنية في صفحة كل منتج، وبعض المنتجات تتضمن ملف PDF قابلًا للتحميل.'
    },
    {
      question: 'كيف يتم الشحن والتوريد؟',
      answer: 'نتفق معك على موقع التوريد وموعده عند تأكيد عرض السعر.'
    }
  ],
  story: {
    eyebrow: 'من نحن',
    title: 'العربية',
    highlight: 'للاستثمار',
    paragraphs: [
      'العربية للاستثمار مؤسسة صناعية متخصصة في منتجات الجبس والمواد الصناعية، تخدم المصانع والمقاولين وشركات البناء.',
      'نؤمن بأن الجودة الثابتة والمواصفات الواضحة والتوريد المنتظم هي أساس الثقة بيننا وبين عملائنا.',
      'نعمل على تبسيط طلب المنتجات الصناعية ليصل إليك ما تحتاجه بالمواصفات والتعبئة التي تناسب عملك.'
    ]
  }
});