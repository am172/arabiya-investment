import Icon from '@/components/ui/Icon';
import Reveal from '@/components/ui/Reveal';
import SectionTitle from '@/components/ui/SectionTitle';
import { getT } from '@/lib/serverTexts';
import { getHeadings } from '@/lib/headings';

// انحناءات الأيقونة والإطار (نفس الشكل للاثنين)
const ICON_SHAPE = 'rounded-tl-2xl rounded-tr-[28px] rounded-br-[28px] rounded-bl-none';
// شكل الكارد: انحناء في الشمال الغربي (أعلى اليسار) والجنوب الشرقي (أسفل اليمين) فقط
const CARD_SHAPE = 'rounded-tl-[80px] rounded-br-[80px] rounded-tr-none rounded-bl-none';

export default async function FeaturesBento({ features }) {
    if (!features || features.length === 0) return null;

    const t = await getT();
    const { eyebrow, title, highlight } = getHeadings(t).features;
    const odd = features.length % 2 === 1;

    return (
        <section
            id="features"
            className="relative py-20 overflow-hidden border-y border-border bg-surface sm:py-28"
        >
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-24 start-1/3 h-96 w-96 rounded-full bg-primary/10 blur-[140px]" />
                <div className="absolute -bottom-24 end-1/3 h-96 w-96 rounded-full bg-accent/10 blur-[140px]" />
            </div>

            <div className="relative px-5 mx-auto max-w-7xl sm:px-8">
                <SectionTitle eyebrow={eyebrow} title={title} highlight={highlight} />

                <ul className="grid grid-cols-1 mt-20 md:grid-cols-2 gap-x-6 gap-y-16">
                    {features.map((feature, index) => {
                        // لو العدد فردي: آخر كارد يتوسّط الصف بنفس عرض باقي الكاردات
                        const isLastOdd = odd && index === features.length - 1;
                        const center = isLastOdd ? 'md:col-span-2 md:mx-auto md:w-[calc(50%-0.75rem)]' : '';

                        return (
                            <Reveal
                                key={`${feature.title}-${index}`}
                                as="li"
                                delay={(index % 2) * 0.08}
                                className={`flex ${center}`}
                            >
                                <article
                                    className={`group relative flex w-full flex-col items-center border border-transparent bg-white px-7 pb-12 pt-7 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 dark:bg-background/70 sm:px-10 ${CARD_SHAPE}`}
                                >
                                    {/* الأيقونة: المربع الأزرق تحت، والإطار الأسود فوقه وقريب منه بنفس الانحناءات */}
                                    <div className="relative mb-6 -mt-14 h-16 w-16 sm:h-[72px] sm:w-[72px]">
                                        <span className={`absolute inset-0 flex items-center justify-center text-primary-foreground transition-transform duration-300 shadow-lg bg-gradient-to-br from-primary to-accent shadow-primary/30 group-hover:scale-105 ${ICON_SHAPE}`}>
                                            <Icon name={feature.icon} size={28} />
                                        </span>
                                        <span
                                            aria-hidden="true"
                                            className={`absolute inset-0 z-10 -translate-x-1 -translate-y-1 border-2 pointer-events-none border-foreground transition-transform duration-300 group-hover:-translate-x-1.5 group-hover:-translate-y-1.5 dark:border-white/80 ${ICON_SHAPE}`}
                                        />
                                    </div>

                                    <h3 className="text-xl font-extrabold transition-colors duration-300 text-primary sm:text-2xl">
                                        {feature.title}
                                    </h3>
                                    <p className="max-w-md mx-auto mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                                        {feature.text}
                                    </p>
                                </article>
                            </Reveal>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
}