import { onColor } from '../utils/themeColors';

const LIGHT_STATUS = { success: '#16A34A', warning: '#D97706', error: '#DC2626' };
const DARK_STATUS = { success: '#4ADE80', warning: '#FBBF24', error: '#F87171' };

const palette = (values, status) => {
    const [primary, secondary, accent, background, surface, text, textMuted, border] = values;
    return {
        primary,
        primaryForeground: onColor(primary),
        secondary,
        secondaryForeground: onColor(secondary),
        accent,
        background,
        surface,
        text,
        textMuted,
        border,
        ...status
    };
};

const theme = (name, label, fonts, borderRadius, light, dark, mode = 'light') => ({
    name,
    label,
    fonts: { heading: fonts[0], body: fonts[1] },
    borderRadius,
    mode,
    colors: palette(light, LIGHT_STATUS),
    darkColors: palette(dark, DARK_STATUS)
});

// الثيم الافتراضي للموقع (الأقرب لهوية الشركة في تصميم الفيجما)
export const DEFAULT_THEME_NAME = 'arabia-primary';

// ترتيب الألوان في كل مصفوفة:
// [primary, secondary, accent, background, surface, text, textMuted, border]
export const PRESET_CATEGORIES = [
    /* ───────────────────────── الهوية ───────────────────────── */
    {
        id: 'brand',
        category: 'هوية العربية',
        description: 'الثيم الأساسي المطابق لتصميم الموقع، مع تدرجات قريبة منه بنفس روح الهوية الزرقاء.',
        icon: 'star',
        themes: [
            theme('arabia-primary', 'العربية الأساسي', ['Cairo', 'Cairo'], 'sm',
                ['#0F3BE0', '#0B1B5E', '#2E8BFF', '#FFFFFF', '#F4F6FA', '#0B1020', '#5B6475', '#E2E6EE'],
                ['#5B84FF', '#A9BCFF', '#38BDF8', '#060A1C', '#0D1430', '#EEF2FF', '#9AA5C7', '#1E2A57']),
            theme('arabia-navy', 'كحلي العربية', ['Cairo', 'Cairo'], 'sm',
                ['#0A1F6B', '#0F3BE0', '#38A5F0', '#FFFFFF', '#F2F5FC', '#091238', '#55608A', '#DCE3F3'],
                ['#7F9CFF', '#4D75FF', '#5BC0F8', '#050918', '#0B1230', '#ECF0FF', '#97A3CF', '#1B2756']),
            theme('arabia-sky', 'سماء العربية', ['Tajawal', 'Cairo'], 'md',
                ['#1565FF', '#0A2A8F', '#00B4D8', '#FAFCFF', '#EEF4FF', '#0C1A3D', '#5A6C96', '#D8E4FA'],
                ['#6AA0FF', '#9DBBFF', '#22D3EE', '#07101F', '#0E1B34', '#EAF2FF', '#98ABD0', '#1D3157']),
            theme('arabia-steel', 'فولاذ العربية', ['IBM Plex Sans Arabic', 'IBM Plex Sans Arabic'], 'sm',
                ['#2A4FBF', '#1F2937', '#5E8BFF', '#FAFBFC', '#F0F2F6', '#111827', '#5B6577', '#DDE1E9'],
                ['#7C9BF0', '#CBD5E1', '#6E9BFF', '#0B0E14', '#131824', '#EEF1F7', '#9AA3B5', '#252C3B']),
            theme('arabia-gold', 'أزرق وذهب', ['Cairo', 'Cairo'], 'sm',
                ['#12399F', '#B8934A', '#2E8BFF', '#FFFFFF', '#F6F5F0', '#0D1333', '#5B6070', '#E6E2D3'],
                ['#6F93FF', '#D1AE63', '#5BA8FF', '#070A1F', '#0F1432', '#F3F5FF', '#A1A8CC', '#222A58']),
            theme('arabia-ink', 'حبر العربية (داكن)', ['Cairo', 'Cairo'], 'sm',
                ['#0F3BE0', '#0B1B5E', '#2E8BFF', '#F7F9FF', '#ECF0FC', '#0B1020', '#5B6475', '#D9E0F2'],
                ['#4C7BFF', '#8FA9FF', '#38BDF8', '#04071A', '#0A1030', '#F0F4FF', '#9BA6CE', '#1A2658'], 'dark')
        ]
    },

    /* ───────────────────────── درجات الأزرق ───────────────────────── */
    {
        id: 'blues',
        category: 'درجات الأزرق',
        description: 'بدائل زرقاء متنوعة (كوبالت، خليجي، نيلي، فيروزي) تناسب أي تعديل مستقبلي على الهوية.',
        icon: 'cloud',
        themes: [
            theme('cobalt', 'كوبالت', ['Readex Pro', 'Cairo'], 'md',
                ['#0047D6', '#0B2A6F', '#00A6FB', '#FFFFFF', '#F1F5FD', '#0A1A3C', '#566790', '#D9E3F7'],
                ['#5C93FF', '#A3C0FF', '#3CC4FF', '#06101F', '#0C1B33', '#EAF2FF', '#98ABD0', '#1B3158']),
            theme('azure-bay', 'أزرق الخليج', ['Almarai', 'Almarai'], 'lg',
                ['#0077C8', '#003B73', '#00C2A8', '#F8FCFF', '#EAF5FC', '#06243D', '#4D7690', '#CFE6F5'],
                ['#38B0F5', '#8CCBF2', '#2DD4BF', '#04131D', '#0A2232', '#E4F5FF', '#8DB6CC', '#133F58']),
            theme('indigo-wave', 'نيلي', ['Noto Kufi Arabic', 'Cairo'], 'md',
                ['#3730D8', '#1E1B6B', '#38BDF8', '#FFFFFF', '#F3F3FF', '#14123D', '#5E5C94', '#E0E0F8'],
                ['#8E8BFF', '#B9B6FF', '#38BDF8', '#0A0924', '#141238', '#EEEEFF', '#A5A3D8', '#26235E']),
            theme('slate-blue', 'أزرق رمادي', ['IBM Plex Sans Arabic', 'Cairo'], 'sm',
                ['#3D5A99', '#1F2A44', '#7AA2E3', '#F9FAFC', '#EEF1F6', '#161E30', '#5C6780', '#DADFEA'],
                ['#8BA6DB', '#C3D0EC', '#8DB5F0', '#0C111C', '#151C2B', '#EDF1F8', '#9CA7BE', '#263049']),
            theme('ocean-teal', 'فيروزي بحري', ['Cairo', 'Cairo'], 'md',
                ['#0B7C9C', '#0A2F57', '#0F3BE0', '#F7FDFF', '#E7F5F9', '#062B3A', '#4A7686', '#CDE8F0'],
                ['#38C0E0', '#7FB6F0', '#6C8CFF', '#041820', '#0A2A36', '#E2F8FF', '#8CBBC9', '#124455']),
            theme('electric-blue', 'أزرق كهربائي', ['Alexandria', 'Cairo'], 'sm',
                ['#0A3DFF', '#0A0F2C', '#00B8D9', '#FFFFFF', '#F2F5FF', '#0A0F2C', '#4F5A85', '#DCE3FA'],
                ['#4D7DFF', '#E2E8FF', '#22D3EE', '#050816', '#0C1230', '#EEF2FF', '#98A3CF', '#1C2760'])
        ]
    },

    /* ───────────────────────── داكن ───────────────────────── */
    {
        id: 'dark',
        category: 'داكن وعالي التباين',
        description: 'ثيمات تفتح بالوضع الداكن بدرجات زرقاء وفحمية، وثيم بأقصى تباين لسهولة القراءة.',
        icon: 'moon',
        themes: [
            theme('midnight-blue', 'أزرق منتصف الليل', ['Cairo', 'Cairo'], 'sm',
                ['#1D4ED8', '#0F172A', '#38BDF8', '#F8FAFF', '#EEF2FB', '#0B1226', '#566386', '#DBE3F4'],
                ['#5B8CFF', '#A5B8FF', '#38BDF8', '#050B1A', '#0C1530', '#EEF3FF', '#9AA7CB', '#1B2A52'], 'dark'),
            theme('deep-space', 'فضاء عميق', ['Readex Pro', 'Cairo'], 'md',
                ['#2F44D4', '#111A3F', '#22D3EE', '#F6F8FF', '#EBEFFC', '#0C1230', '#5A6590', '#D8DFF5'],
                ['#7C8CFF', '#B1BBFF', '#22D3EE', '#03040F', '#0A0C22', '#EDEFFF', '#9AA0CC', '#1A1D45'], 'dark'),
            theme('carbon-blue', 'كربون أزرق', ['IBM Plex Sans Arabic', 'IBM Plex Sans Arabic'], 'sm',
                ['#2563EB', '#18181B', '#06B6D4', '#FFFFFF', '#F4F4F5', '#09090B', '#52525B', '#E4E4E7'],
                ['#60A5FA', '#D4D4D8', '#22D3EE', '#09090B', '#141417', '#F4F4F5', '#A1A1AA', '#27272A'], 'dark'),
            theme('obsidian-cyan', 'سبج وسماوي', ['Tajawal', 'Cairo'], 'lg',
                ['#0E7490', '#0F172A', '#2563EB', '#F8FEFF', '#E8F6F9', '#07202A', '#4B7280', '#CBE6EC'],
                ['#22D3EE', '#7DD3FC', '#6C8CFF', '#050B10', '#0B1820', '#E6FAFF', '#8DB4BF', '#123240'], 'dark')
        ]
    },

    /* ───────────────────────── صناعي وإنشائي ───────────────────────── */
    {
        id: 'industrial',
        category: 'صناعي وإنشائي',
        description: 'ألوان الخرسانة والفولاذ وخوذة الأمان، قريبة من أجواء الجبس والإنشاءات والمصانع.',
        icon: 'square',
        themes: [
            theme('safety-yellow', 'أصفر الأمان', ['Cairo', 'Cairo'], 'none',
                ['#1F2937', '#FFC400', '#0F3BE0', '#FFFFFF', '#F5F5F4', '#111827', '#57534E', '#E7E5E4'],
                ['#FFC400', '#E5E7EB', '#5B84FF', '#0F1012', '#1A1C1F', '#F5F5F4', '#A8A29E', '#2E3035']),
            theme('concrete', 'خرسانة', ['IBM Plex Sans Arabic', 'IBM Plex Sans Arabic'], 'sm',
                ['#4B5563', '#0F3BE0', '#F59E0B', '#F7F7F5', '#ECECE8', '#1C1F24', '#6B7280', '#D9D9D3'],
                ['#9CA3AF', '#6A8CFF', '#FBBF24', '#0F1113', '#181B1E', '#F3F4F6', '#A1A7B0', '#2B3036']),
            theme('steel-orange', 'فولاذ وبرتقالي', ['Alexandria', 'Cairo'], 'sm',
                ['#D9480F', '#1E3A5F', '#F59F00', '#FFFAF5', '#F6EEE8', '#1C1410', '#78685D', '#E8D9CC'],
                ['#FF7A3D', '#7FA8D8', '#FBBF24', '#12100F', '#1D1916', '#FBF1EA', '#B9A89B', '#35291F']),
            theme('blueprint', 'مخطط هندسي', ['Noto Kufi Arabic', 'Cairo'], 'none',
                ['#0B3D91', '#0F3BE0', '#00B8D9', '#F3F7FF', '#E4ECFB', '#0A1F4D', '#4F628F', '#C6D5F2'],
                ['#5C8DFF', '#8FB0FF', '#4FD6F0', '#04122E', '#0A1F4A', '#E6EEFF', '#90A6D6', '#1A3A78'])
        ]
    },

    /* ───────────────────────── أعمال وثقة ───────────────────────── */
    {
        id: 'corporate',
        category: 'أعمال وثقة',
        description: 'ألوان رصينة للشركات والمكاتب الاستشارية والخدمات المالية.',
        icon: 'briefcase',
        themes: [
            theme('navy-authority', 'سلطة كحلية', ['IBM Plex Sans Arabic', 'IBM Plex Sans Arabic'], 'sm',
                ['#12295E', '#C8A04A', '#1E7BC6', '#FFFFFF', '#F3F6FB', '#0E1A33', '#54637F', '#DCE3EF'],
                ['#7FA2E8', '#E0BD6A', '#4DA3E8', '#070E1F', '#0E1830', '#EAF0FF', '#9AA8C6', '#1F2E52']),
            theme('graphite-copper', 'جرافيت ونحاس', ['Noto Kufi Arabic', 'Cairo'], 'md',
                ['#2F3640', '#B87333', '#3E8E9E', '#FAFAF9', '#F0EFEC', '#1B1F24', '#5E656E', '#DEDCD6'],
                ['#AEB8C4', '#E09A5E', '#62B6C6', '#101214', '#181B1F', '#F1F2F4', '#A0A8B2', '#2A2F36']),
            theme('finance-green', 'أخضر مالي', ['Cairo', 'Readex Pro'], 'sm',
                ['#0A6B3F', '#0F2D52', '#D4A017', '#FFFFFF', '#F1F8F4', '#0B2417', '#4E6B5C', '#D2E6DA'],
                ['#4ADE9A', '#6FA8E8', '#E8B93D', '#06120C', '#0C1F15', '#E8FAEF', '#93BBA4', '#17402B']),
            theme('burgundy-trust', 'عنابي رسمي', ['Tajawal', 'Cairo'], 'sm',
                ['#7A1F3D', '#1F2937', '#C8A04A', '#FFFFFF', '#FAF4F6', '#2A0F19', '#7A5560', '#EBD9DF'],
                ['#E07A9B', '#D1D5DB', '#E0BD6A', '#14080C', '#211017', '#FBEFF3', '#C2A0AB', '#3F1D29'])
        ]
    },

    /* ───────────────────────── سعودي وتراثي ───────────────────────── */
    {
        id: 'saudi',
        category: 'سعودي وتراثي',
        description: 'الأخضر السعودي والزمرد والذهب والرمال بروح الهوية المحلية والعمارة التراثية.',
        icon: 'landmark',
        themes: [
            theme('saudi-green', 'الأخضر السعودي', ['Cairo', 'Cairo'], 'sm',
                ['#006C35', '#0B2A1D', '#C9A24B', '#FFFFFF', '#F2F8F4', '#0B2016', '#4E6B5C', '#D2E6DA'],
                ['#2FC27A', '#9AD9B8', '#E0BD6A', '#05120B', '#0B2016', '#E8FAEF', '#93BBA4', '#17402B']),
            theme('emerald-gold', 'زمرد وذهب', ['El Messiri', 'Cairo'], 'sm',
                ['#0B5D4B', '#C9A24B', '#1B8A6B', '#FFFDF7', '#F6F0E0', '#10231D', '#5B6B63', '#E4D9BC'],
                ['#3DC9A0', '#D8B35E', '#2FA58A', '#08150F', '#0F211A', '#F4EFDF', '#A3B3A9', '#1F3A2F']),
            theme('lapis-brass', 'لازورد ونحاس', ['Reem Kufi', 'IBM Plex Sans Arabic'], 'md',
                ['#1F3C88', '#B7791F', '#0E8A9B', '#FBFAF6', '#F1F4FA', '#0F1B3D', '#55607F', '#D9E0EE'],
                ['#7FA3F5', '#E0A84A', '#38BDCB', '#0A1226', '#101B38', '#EEF2FF', '#9FAACB', '#22305A']),
            theme('desert-sand', 'رمال الصحراء', ['Markazi Text', 'Readex Pro'], 'lg',
                ['#B4532A', '#2F5D50', '#E0A458', '#FFF9F0', '#F8EBD8', '#3A2418', '#7A6150', '#EBD6B8'],
                ['#E0845A', '#5FA88F', '#E8B96A', '#1A100A', '#261811', '#FBEEDB', '#C2A68D', '#3D2A1E'])
        ]
    },

    /* ───────────────────────── رخام وفخامة ───────────────────────── */
    {
        id: 'luxe',
        category: 'رخام وفخامة',
        description: 'ألوان الرخام والترافرتين والذهب لواجهات فاخرة تناسب منتجات الديكور والتشطيبات.',
        icon: 'sparkles',
        themes: [
            theme('white-marble', 'رخام أبيض', ['Cairo', 'Cairo'], 'sm',
                ['#2B2F36', '#B08D57', '#5B84C7', '#FBFBFA', '#F1F0EE', '#17181B', '#6B6A68', '#E3E1DC'],
                ['#E5E1D8', '#D1AE63', '#7FA2E8', '#0E0E10', '#18181B', '#F5F3EE', '#A9A59C', '#2D2D31']),
            theme('onyx-gold', 'عقيق وذهب', ['El Messiri', 'Cairo'], 'sm',
                ['#1C1917', '#C9A24B', '#8B5E34', '#FAF8F4', '#F0ECE4', '#1C1917', '#78716C', '#E2DCCF'],
                ['#D8B35E', '#E7D3A0', '#B98B5A', '#0C0A09', '#171412', '#F7F2E8', '#B2A899', '#2C2620'], 'dark'),
            theme('travertine', 'ترافرتين', ['Noto Naskh Arabic', 'IBM Plex Sans Arabic'], 'sm',
                ['#8A6A4A', '#2F4A44', '#C9A36B', '#FBF8F3', '#F1EADF', '#2B2018', '#7C6A58', '#E2D6C3'],
                ['#C9A47C', '#7FB3A6', '#E0BE85', '#15100C', '#201812', '#F6EEE2', '#B8A58F', '#392C20'])
        ]
    },

    /* ───────────────────────── دافئ وتحريري ───────────────────────── */
    {
        id: 'editorial',
        category: 'تحريري ودافئ',
        description: 'ألوان الورق والطين والزيتون بروح المجلات والمحتوى التعريفي.',
        icon: 'newspaper',
        themes: [
            theme('paper-terracotta', 'ورق وطين', ['Noto Naskh Arabic', 'IBM Plex Sans Arabic'], 'sm',
                ['#9C3D1B', '#1F3A34', '#D99A2B', '#FBF6EC', '#F2E9D6', '#2A1D14', '#75604C', '#DDCDB0'],
                ['#E88A5C', '#6FB5A3', '#E8B04F', '#17120C', '#221A12', '#F5ECDD', '#BDA98F', '#3A2D20']),
            theme('newsprint', 'جريدة', ['Markazi Text', 'Readex Pro'], 'none',
                ['#B91C1C', '#111111', '#CA8A04', '#F7F4EE', '#ECE7DC', '#121212', '#5E5A52', '#CFC8B8'],
                ['#F06464', '#EDEDED', '#E2B33B', '#121110', '#1C1B19', '#F4F1EA', '#B3AEA2', '#35322C']),
            theme('olive-grove', 'بستان الزيتون', ['El Messiri', 'Readex Pro'], 'md',
                ['#556B2F', '#B8860B', '#8B4A2B', '#FAF8F0', '#EEEBD9', '#262B14', '#666B45', '#D8D4B8'],
                ['#A5BF6B', '#E0B23E', '#D98A63', '#11140A', '#1B2010', '#F1F3E2', '#B0B58A', '#313A1A'])
        ]
    },

    /* ───────────────────────── جريء ───────────────────────── */
    {
        id: 'brutalist',
        category: 'جريء وعالي التباين',
        description: 'ألوان صلبة وحواف حادة وحدود واضحة لهوية جريئة، مع ثيم بأقصى تباين.',
        icon: 'square',
        themes: [
            theme('blue-slab', 'بلوك أزرق', ['Changa', 'Cairo'], 'none',
                ['#0F3BE0', '#111111', '#FFD60A', '#F5F7FF', '#FFFFFF', '#111111', '#444444', '#111111'],
                ['#5B84FF', '#F5F5F5', '#FFD60A', '#0B0B0F', '#17171D', '#F5F7FF', '#BDBDC8', '#EDEDED']),
            theme('yellow-slab', 'بلوك أصفر', ['Changa', 'Readex Pro'], 'none',
                ['#FFD60A', '#111111', '#0F3BE0', '#FFFBEA', '#FFFFFF', '#111111', '#444444', '#111111'],
                ['#FFD60A', '#F5F5F5', '#5B84FF', '#111111', '#1C1C1C', '#FFFBEA', '#BDBDBD', '#EDEDED']),
            theme('max-contrast', 'تباين أقصى', ['IBM Plex Sans Arabic', 'IBM Plex Sans Arabic'], 'none',
                ['#000000', '#FFE600', '#0047FF', '#FFFFFF', '#F2F2F2', '#000000', '#3D3D3D', '#1A1A1A'],
                ['#FFFFFF', '#FFE600', '#4D8DFF', '#000000', '#0D0D0D', '#FFFFFF', '#CFCFCF', '#8A8A8A'])
        ]
    }
];