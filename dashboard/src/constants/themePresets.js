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

export const PRESET_CATEGORIES = [
    {
        id: 'islamic',
        category: 'إسلامي وتراثي',
        description: 'ألوان الزمرد والذهب واللازورد والرمال بروح الفن الإسلامي والعمارة التراثية.',
        icon: 'landmark',
        themes: [
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
    {
        id: 'edtech',
        category: 'تعليم وأكاديميات',
        description: 'هويات واضحة وموثوقة للمنصات التعليمية والجامعات والمراكز التدريبية.',
        icon: 'graduation',
        themes: [
            theme('bright-learn', 'تعلّم مشرق', ['Rubik', 'Cairo'], 'xl',
                ['#2563EB', '#FBBF24', '#10B981', '#FFFFFF', '#F3F7FF', '#0F172A', '#5B6B86', '#DCE6F8'],
                ['#6C9BFF', '#FCD34D', '#34D399', '#0B1120', '#121A2E', '#EAF0FF', '#9CA9C6', '#232F4D']),
            theme('campus-indigo', 'حرم جامعي', ['Noto Kufi Arabic', 'IBM Plex Sans Arabic'], 'md',
                ['#3730A3', '#F97316', '#06B6D4', '#FFFFFF', '#F5F5FF', '#1E1B4B', '#5F5B8F', '#E0E0F7'],
                ['#8B8CFF', '#FB923C', '#22D3EE', '#0D0B26', '#15133A', '#EEF0FF', '#A5A3D6', '#2A2760']),
            theme('scholar-teal', 'أكاديمية فيروزية', ['Changa', 'Cairo'], 'lg',
                ['#0F766E', '#F43F5E', '#F59E0B', '#F7FDFC', '#ECF8F6', '#0B2B28', '#4F7774', '#CBE9E5'],
                ['#2DD4BF', '#FB7185', '#FBBF24', '#061816', '#0C2420', '#E6FBF8', '#8FC0BB', '#164039'])
        ]
    },
    {
        id: 'kids',
        category: 'أطفال ولعب',
        description: 'ألوان مبهجة وحواف مستديرة لروضات الأطفال وتطبيقات التعليم المرح.',
        icon: 'smile',
        themes: [
            theme('candy-pop', 'حلوى ملوّنة', ['Baloo Bhaijaan 2', 'Cairo'], 'full',
                ['#E11D74', '#7C3AED', '#06B6D4', '#FFFBFE', '#FFF0F8', '#3B0A2A', '#9A4F7C', '#FAD0E8'],
                ['#FF5FA8', '#A78BFA', '#22D3EE', '#1A0A14', '#27101E', '#FFEAF5', '#D79BBD', '#4A1D38']),
            theme('sunny-day', 'يوم مشمس', ['Changa', 'Cairo'], 'xl',
                ['#F5A400', '#2563EB', '#EF4444', '#FFFDF2', '#FFF4C7', '#3B2A00', '#8A6A12', '#F8E49A'],
                ['#FFC22E', '#6EA0FF', '#FF7A7A', '#17120A', '#241C0C', '#FFF6D9', '#CDB57A', '#4A3A12']),
            theme('ocean-pals', 'أصدقاء المحيط', ['Readex Pro', 'Cairo'], 'full',
                ['#0284C7', '#14B8A6', '#FF7A59', '#F4FBFF', '#E3F4FD', '#07324A', '#4C7C96', '#BFE3F5'],
                ['#38BDF8', '#2DD4BF', '#FF8F73', '#04131C', '#0A2230', '#E3F6FF', '#8FBBD1', '#14425A']),
            theme('jungle-fun', 'مغامرة الغابة', ['Baloo Bhaijaan 2', 'Cairo'], 'xl',
                ['#16A34A', '#A855F7', '#F97316', '#FFFFFF', '#F0FBEA', '#12301A', '#55805F', '#CDEBC4'],
                ['#4ADE80', '#C084FC', '#FB923C', '#07140B', '#0E2214', '#E8FBEA', '#93C49C', '#1B4026'])
        ]
    },
    {
        id: 'dark',
        category: 'داكن وعالي التباين',
        description: 'مواقع تفتح بالوضع الداكن، وتصميم أقصى تباين لسهولة القراءة.',
        icon: 'moon',
        themes: [
            theme('midnight-violet', 'بنفسجي منتصف الليل', ['Noto Kufi Arabic', 'IBM Plex Sans Arabic'], 'lg',
                ['#6D28D9', '#EC4899', '#22D3EE', '#FBFAFF', '#F1EDFE', '#1B0F3A', '#6A5C94', '#DED5F7'],
                ['#A78BFA', '#F472B6', '#22D3EE', '#09061A', '#120D2B', '#F3EFFF', '#A99CD0', '#2A1F55'], 'dark'),
            theme('carbon-lime', 'كربون وليموني', ['Readex Pro', 'Cairo'], 'sm',
                ['#4D7C0F', '#0369A1', '#C2410C', '#FFFFFF', '#F4F4F5', '#0A0A0A', '#52525B', '#E4E4E7'],
                ['#A3E635', '#38BDF8', '#F97316', '#0A0A0A', '#141414', '#F5F5F5', '#A3A3A3', '#2A2A2A'], 'dark'),
            theme('ink-ember', 'حبر وجمر', ['El Messiri', 'Cairo'], 'md',
                ['#C2410C', '#B45309', '#BE123C', '#FFFAF5', '#FDEEDF', '#2B1308', '#7E5A44', '#F1D8C2'],
                ['#FF6B35', '#FFB703', '#F94144', '#0F0B0A', '#1A1210', '#FBEFE6', '#BBA192', '#35241C'], 'dark'),
            theme('max-contrast', 'تباين أقصى', ['IBM Plex Sans Arabic', 'IBM Plex Sans Arabic'], 'none',
                ['#000000', '#FFE600', '#0047FF', '#FFFFFF', '#F2F2F2', '#000000', '#3D3D3D', '#1A1A1A'],
                ['#FFFFFF', '#FFE600', '#4D8DFF', '#000000', '#0D0D0D', '#FFFFFF', '#CFCFCF', '#8A8A8A'])
        ]
    },
    {
        id: 'editorial',
        category: 'تحريري ودافئ',
        description: 'ألوان الورق والطين والزيتون بروح المجلات والكتب والنشر.',
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
    {
        id: 'brutalist',
        category: 'جريء (بروتالي)',
        description: 'ألوان صلبة وحواف حادة وحدود سوداء لهوية جريئة لا تُنسى.',
        icon: 'square',
        themes: [
            theme('yellow-slab', 'بلوك أصفر', ['Changa', 'Readex Pro'], 'none',
                ['#FFD60A', '#111111', '#FF3D81', '#FFFBEA', '#FFFFFF', '#111111', '#444444', '#111111'],
                ['#FFD60A', '#F5F5F5', '#FF5C99', '#111111', '#1C1C1C', '#FFFBEA', '#BDBDBD', '#EDEDED']),
            theme('pink-riot', 'ثورة وردية', ['Changa', 'Cairo'], 'none',
                ['#E6007A', '#1B1B1B', '#00C48C', '#FFF1F8', '#FFFFFF', '#1B1B1B', '#4A4A4A', '#1B1B1B'],
                ['#FF4DA6', '#F2F2F2', '#19E6A8', '#160A11', '#22101A', '#FFEAF4', '#D9A3BF', '#E9C3D6']),
            theme('mint-block', 'بلوك نعناعي', ['Readex Pro', 'Cairo'], 'none',
                ['#007F5F', '#FFB703', '#3A86FF', '#EAFBF3', '#FFFFFF', '#0B1F18', '#3F5E52', '#0B1F18'],
                ['#2EE6A6', '#FFC53D', '#6EA8FF', '#07130E', '#0E1F17', '#E9FFF5', '#9CC9B7', '#D6F5E8'])
        ]
    },
    {
        id: 'neon',
        category: 'زجاجي ونيون',
        description: 'ألوان لامعة وعصرية للتقنية والألعاب والفعاليات.',
        icon: 'sparkles',
        themes: [
            theme('aurora-neon', 'شفق نيون', ['Rubik', 'Readex Pro'], 'xl',
                ['#0891B2', '#A21CAF', '#4D7C0F', '#F4FBFF', '#E4F3FB', '#06222F', '#476B7F', '#C2E1EE'],
                ['#22D3EE', '#E879F9', '#A3E635', '#050816', '#0C1230', '#EAF6FF', '#8FA6C9', '#1B2A5C'], 'dark'),
            theme('synthwave', 'سينث ويف', ['Changa', 'Cairo'], 'lg',
                ['#BE1A78', '#6D28D9', '#0284C7', '#FFF6FD', '#F6E6F8', '#2A0E3A', '#7A5290', '#E8CDF0'],
                ['#FF3CAC', '#8B5CF6', '#2BD2FF', '#130B2B', '#1E1245', '#FDE8FF', '#B79BDD', '#3A2275'], 'dark'),
            theme('ice-glass', 'زجاج جليدي', ['IBM Plex Sans Arabic', 'Cairo'], 'xl',
                ['#3B82F6', '#8B5CF6', '#14B8A6', '#F3F8FF', '#E8F0FD', '#0F1E3D', '#5A6E94', '#CFDDF5'],
                ['#7AA7FF', '#A78BFA', '#2DD4BF', '#070D1F', '#0F1830', '#E8F0FF', '#98A9CC', '#1F2E55'])
        ]
    },
    {
        id: 'pastel',
        category: 'باستيل هادئ',
        description: 'ألوان ناعمة ومريحة للعين لمراكز الرعاية والتطوير الذاتي والمحتوى الهادئ.',
        icon: 'cloud',
        themes: [
            theme('lilac-cloud', 'سحابة ليلكية', ['Readex Pro', 'Cairo'], 'full',
                ['#7C5CC4', '#F4C6E7', '#7CC6B8', '#FCFAFF', '#F4EFFB', '#2E2347', '#7B6E96', '#E6DCF5'],
                ['#B8A0F0', '#E9A9D2', '#86D9C9', '#130F1F', '#1D1730', '#F3EEFF', '#AFA3CC', '#342A52']),
            theme('peach-cream', 'كريمة الخوخ', ['Cairo', 'Readex Pro'], 'xl',
                ['#C4553A', '#FBD3B8', '#6DB5A2', '#FFFAF6', '#FDEFE4', '#3A2218', '#8A6554', '#F5DCCB'],
                ['#F0937A', '#E8B79A', '#7CCDB9', '#1A100C', '#271812', '#FFF1E8', '#C9A794', '#432B20']),
            theme('sage-mist', 'ضباب المريمية', ['IBM Plex Sans Arabic', 'Cairo'], 'lg',
                ['#4F7360', '#DCE8DF', '#C9A27A', '#F8FBF8', '#EDF3EE', '#1F2D25', '#66786D', '#D5E2D8'],
                ['#8FBBA0', '#3A5446', '#D9B68A', '#0C1410', '#14201A', '#EAF3ED', '#9DB3A5', '#25382E']),
            theme('sky-whisper', 'همس السماء', ['Noto Kufi Arabic', 'Cairo'], 'xl',
                ['#3F73C9', '#CFE3FA', '#F2A7B8', '#F8FBFF', '#EDF4FD', '#1A2B47', '#62789C', '#D6E4F7'],
                ['#86AEF0', '#2B4570', '#F2A7C0', '#0A1220', '#121D33', '#EAF1FF', '#9DB2D4', '#223557'])
        ]
    },
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
                ['#4ADE9A', '#6FA8E8', '#E8B93D', '#06120C', '#0C1F15', '#E8FAEF', '#93BBA4', '#17402B'])
        ]
    },
    {
        id: 'brand',
        category: 'هويتي',
        description: 'قوالب الهوية الخاصة بك.',
        icon: 'star',
        themes: [
            theme('nebras', 'نبراس', ['Cairo', 'Cairo'], 'md',
                ['#0D1333', '#B8934A', '#0F6B49', '#FFFFFF', '#F8FAFC', '#0D1333', '#475569', '#E2E8F0'],
                ['#D1AE63', '#8F9BE0', '#2FB589', '#070A1F', '#0E1430', '#F1F4FF', '#A0A9CF', '#222B5A'])
        ]
    }
];