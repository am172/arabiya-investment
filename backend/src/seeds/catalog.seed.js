const Admin = require('../models/Admin.model');
const Node = require('../models/CatalogNode.model');
const OptionTemplate = require('../models/OptionTemplate.model');
const ProductRequest = require('../models/ProductRequest.model');
const service = require('../services/catalog.service');
const logger = require('../utils/logger');

const PACKING = {
    name: 'خيارات التعبئة والكمية',
    description: 'وزن العبوة وطريقة التغليف والكمية المطلوبة',
    options: [
        {
            title: 'وزن العبوة',
            type: 'select',
            isRequired: true,
            values: [{ label: '25 كجم' }, { label: '50 كجم' }, { label: 'توريد صب بالطن' }]
        },
        {
            title: 'طريقة التغليف',
            type: 'radio',
            isRequired: false,
            values: [{ label: 'شكاير ورق' }, { label: 'شكاير بلاستيك مبطنة' }, { label: 'جامبو باج' }]
        },
        { title: 'الكمية المطلوبة', type: 'number', isRequired: true, min: 1, step: 0.5, unit: 'طن', defaultNumber: 1 }
    ]
};

const DELIVERY = {
    name: 'خيارات التوريد',
    description: 'موقع التوريد والموعد والملاحظات',
    options: [
        { title: 'موقع التوريد', type: 'text', isRequired: true, placeholder: 'المدينة / اسم المصنع أو الموقع', maxLength: 150 },
        { title: 'موعد التوريد المطلوب', type: 'text', isRequired: false, placeholder: 'مثال: خلال أسبوعين', maxLength: 100 },
        { title: 'ملاحظات إضافية', type: 'textarea', isRequired: false, maxLength: 1000 }
    ]
};

const grade = (values) => ({
    title: 'درجة النعومة',
    type: 'select',
    isRequired: false,
    values: values.map((label) => ({ label }))
});

const product = (name, summary, extra) => ({
    kind: 'product',
    name,
    summary,
    isFeatured: Boolean(extra.featured),
    inheritOptions: true,
    allowOrderRequest: true,
    ctaLabel: 'طلب منتج',
    badges: extra.badges || [],
    features: extra.features.map((title) => ({ icon: 'shield-check', title, text: '' })),
    specs: extra.specs.map(([label, value]) => ({ group: 'المواصفات العامة', label, value })),
    description: extra.description,
    options: [grade(extra.grades), ...(extra.more || [])],
    applyDelivery: true
});

const category = (name, summary, children, extra = {}) => ({
    kind: 'category',
    name,
    summary,
    description: extra.description || summary,
    inheritOptions: Boolean(extra.inherit),
    options: extra.options || [],
    children
});

const TREE = [
    category(
        'منتجات الجبس',
        'جبس البناء والصناعات والجبس الخام بمواصفات مناسبة لكل استخدام.',
        [
            category(
                'جبس البناء',
                'جبس المحارة لأعمال التشطيب الداخلية.',
                [
                    product('جبس المحارة اليدوي', 'جبس مطحون مناسب لأعمال المحارة اليدوية الداخلية.', {
                        featured: true,
                        badges: [{ text: 'الأكثر طلبًا', tone: 'success' }],
                        features: ['سهل الخلط والتطبيق', 'سطح نهائي أملس', 'مناسب للأعمال الداخلية'],
                        specs: [
                            ['اللون', 'أبيض إلى أبيض مائل للرمادي'],
                            ['الحالة', 'مطحون ناعم'],
                            ['الاستخدام', 'محارة داخلية'],
                            ['التوريد', 'شكاير أو صب']
                        ],
                        description: 'جبس مخصص لأعمال المحارة الداخلية اليدوية. عدّل هذا الوصف والمواصفات من لوحة التحكم.',
                        grades: ['ناعم', 'متوسط']
                    }),
                    product('جبس المحارة الآلي', 'جبس مناسب للتطبيق بماكينات الرش.', {
                        featured: true,
                        features: ['مناسب لماكينات الرش', 'ثبات في الأداء', 'تغطية جيدة'],
                        specs: [
                            ['اللون', 'أبيض مائل للرمادي'],
                            ['الاستخدام', 'محارة آلية داخلية'],
                            ['التوريد', 'شكاير أو صب']
                        ],
                        description: 'جبس مخصص للتطبيق الآلي. عدّل هذا الوصف والمواصفات من لوحة التحكم.',
                        grades: ['ناعم', 'متوسط']
                    })
                ],
                { inherit: true }
            ),
            category(
                'جبس الصناعات',
                'جبس للصناعات الخزفية والسيراميك.',
                [
                    product('جبس الخزف والسيراميك', 'جبس عالي النعومة لتصنيع القوالب والاستخدامات الصناعية.', {
                        featured: true,
                        features: ['نعومة عالية', 'مناسب للقوالب', 'ثبات بين الدفعات'],
                        specs: [
                            ['اللون', 'أبيض'],
                            ['الحالة', 'مطحون ناعم جدًا'],
                            ['الاستخدام', 'قوالب وصناعات خزفية']
                        ],
                        description: 'جبس للاستخدامات الصناعية الدقيقة. عدّل هذا الوصف والمواصفات من لوحة التحكم.',
                        grades: ['ناعم جدًا', 'ناعم']
                    })
                ],
                { inherit: true }
            ),
            category(
                'الجبس الخام',
                'حجر الجبس الخام للصناعات المختلفة.',
                [
                    product('حجر الجبس الخام', 'مادة خام للصناعات التي تحتاج إلى الجبس بحالته الطبيعية.', {
                        features: ['توريد صب بالطن', 'مناسب للصناعات الثقيلة'],
                        specs: [
                            ['الحالة', 'حجر خام'],
                            ['اللون', 'أبيض إلى رمادي فاتح'],
                            ['التوريد', 'صب بالطن']
                        ],
                        description: 'مادة خام للصناعات المختلفة. عدّل هذا الوصف والمواصفات من لوحة التحكم.',
                        grades: ['حجم كبير', 'حجم متوسط']
                    })
                ],
                { inherit: true }
            )
        ],
        { inherit: false, options: PACKING.options }
    ),
    category(
        'المواد الصناعية',
        'مواد صناعية مكملة لاحتياجات المصانع والمقاولين.',
        [
            product('كربونات الكالسيوم', 'مسحوق مناسب لاستخدامات صناعية متعددة.', {
                featured: true,
                features: ['مسحوق ناعم', 'استخدامات صناعية متعددة'],
                specs: [
                    ['الحالة', 'مسحوق'],
                    ['اللون', 'أبيض'],
                    ['التوريد', 'شكاير أو صب']
                ],
                description: 'مادة صناعية متعددة الاستخدامات. عدّل هذا الوصف والمواصفات من لوحة التحكم.',
                grades: ['ناعم', 'متوسط']
            }),
            product('الجير الصناعي', 'جير للاستخدامات الصناعية والإنشائية.', {
                features: ['مناسب للاستخدامات الصناعية', 'توريد حسب الطلب'],
                specs: [
                    ['الحالة', 'حسب الطلب'],
                    ['التوريد', 'شكاير أو صب']
                ],
                description: 'جير للاستخدامات الصناعية. عدّل هذا الوصف والمواصفات من لوحة التحكم.',
                grades: ['حسب الطلب']
            })
        ],
        { inherit: false, options: PACKING.options }
    )
];

const plant = async (definition, parentId, adminId) => {
    const { children = [], applyDelivery, ...data } = definition;
    const node = await service.createNode({ ...data, parent: parentId }, adminId);

    if (applyDelivery) await service.applyOptions(node, DELIVERY.options, 'append');

    for (const child of children) {
        await plant(child, node._id, adminId);
    }
};

const seedCatalog = async ({ force = false } = {}) => {
    const count = await Node.countDocuments();
    if (count > 0 && !force) {
        logger.info('Catalog already has items, skipping');
        return;
    }

    if (force) {
        await Promise.all([Node.deleteMany({}), OptionTemplate.deleteMany({}), ProductRequest.deleteMany({})]);
    }

    const admin = await Admin.findOne().select('_id').lean();
    const adminId = admin ? admin._id : undefined;

    await OptionTemplate.insertMany(
        [PACKING, DELIVERY].map((template) => ({
            name: template.name,
            description: template.description,
            options: service.normalizeOptions(template.options),
            createdBy: adminId
        }))
    );

    for (const definition of TREE) {
        await plant(definition, null, adminId);
    }

    logger.info('Catalog seeded with sample categories and products. Replace them with real content.');
};

module.exports = seedCatalog;