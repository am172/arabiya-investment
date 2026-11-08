import Image from 'next/image';
import Reveal from '@/components/ui/Reveal';
import CtaBanner from '@/components/ui/CtaBanner';
import Faq from '@/components/ui/Faq';
import StorySection from '@/components/sections/StorySection';
import FeaturesBento from '@/components/sections/FeaturesBento';
import { getContent } from '@/lib/api/content';
import { getT } from '@/lib/serverTexts';
import { getHeadings } from '@/lib/headings';
import { resolveContent } from '@/lib/content';

export const revalidate = 60;

const HERO_VIDEO = '/images/about-hero-slow.mp4';
const HERO_POSTER = '/images/about-hero-poster.jpg';
const SAUDI_IMAGE = '/images/suadi.png';
const LINES_IMAGE = '/images/lines-bg.png';
const FRAME_SHAPE =
    'rounded-tl-[48px] rounded-br-[48px] rounded-tr-xl rounded-bl-xl sm:rounded-tl-[80px] sm:rounded-br-[80px] sm:rounded-tr-2xl sm:rounded-bl-2xl';

const VIDEO_CLIP_ID = 'about-hero-clip';
const VIDEO_CLIP_PATH =
    'M28 0 H896 A14 14 0 0 1 910 14 V26 A14 14 0 0 0 924 40 H1286 A14 14 0 0 1 1300 54 V647 A28 28 0 0 1 1272 675 H414 A14 14 0 0 1 400 661 V649 A14 14 0 0 0 386 635 H28 A28 28 0 0 1 0 607 V28 A28 28 0 0 1 28 0 Z';

export async function generateMetadata() {
    const t = await getT();
    return { title: t('meta_learnMore') };
}

function VideoClipDefs() {
    return (
        <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
            <defs>
                <clipPath id={VIDEO_CLIP_ID} clipPathUnits="objectBoundingBox">
                    <path d={VIDEO_CLIP_PATH} transform="scale(0.000769231 0.00148148)" />
                </clipPath>
            </defs>
        </svg>
    );
}

function AboutHero({ title, highlight, description, badge }) {
    return (
        <section className="relative px-5 pb-10 overflow-hidden pt-28 isolate bg-background sm:px-8 sm:pb-12 sm:pt-32 lg:pt-36">
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none -z-10">
                <div
                    className="absolute inset-0 bg-center bg-no-repeat bg-cover"
                    style={{ backgroundImage: `url(${LINES_IMAGE})` }}
                />
                <div className="absolute inset-0 bg-background/90" />
            </div>
            <div className="mx-auto text-center max-w-7xl">
                <h1 className="text-3xl font-black sm:text-5xl lg:text-6xl text-foreground">
                    {title} <span className="text-primary">{highlight}</span>
                </h1>

                {description && (
                    <p className="max-w-2xl mx-auto mt-3 text-sm text-muted-foreground sm:text-base">
                        {description}
                    </p>
                )}

                <Reveal as="div" className="relative z-10 max-w-5xl mx-auto mt-6 sm:mt-8">
                    <VideoClipDefs />

                    <div className="drop-shadow-[0_25px_35px_rgba(0,0,0,0.18)]">
                        <div
                            className="relative aspect-[1300/675] overflow-hidden"
                            style={{ clipPath: `url(#${VIDEO_CLIP_ID})` }}
                        >
                            <video
                                className="object-cover w-full h-full"
                                src={HERO_VIDEO}
                                poster={HERO_POSTER}
                                autoPlay
                                muted
                                loop
                                playsInline
                                preload="metadata"
                            />
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}

function Block({ title, text, className = '' }) {
    return (
        <Reveal as="div" className={className}>
            <h2 className="text-3xl font-extrabold text-primary sm:text-4xl">{title}</h2>
            <p className="mt-4 leading-loose text-muted-foreground">{text}</p>
        </Reveal>
    );
}

function VisionMission({ vision, mission, imageAlt }) {
    return (
        <section className="px-5 py-16 bg-background sm:px-8 sm:py-24">
            <div className="grid items-center max-w-6xl mx-auto md:grid-cols-2 gap-x-14 gap-y-10">
                <Block {...vision} className="md:col-start-1 md:row-start-1" />

                <Reveal as="div" className="md:col-start-2 md:row-span-2 md:row-start-1">
                    <div className={`overflow-hidden shadow-xl shadow-primary/10 ${FRAME_SHAPE}`}>
                        <Image
                            src={SAUDI_IMAGE}
                            alt={imageAlt}
                            width={0}
                            height={0}
                            sizes="(min-width: 768px) 50vw, 100vw"
                            className="block w-full h-auto"
                        />
                    </div>
                </Reveal>

                <Block {...mission} className="md:col-start-1 md:row-start-2" />
            </div>
        </section>
    );
}

export default async function LearnMorePage() {
    const [raw, t] = await Promise.all([getContent(), getT()]);
    const content = resolveContent(raw);
    const headings = getHeadings(t);
    const hero = headings.learnHero;

    const tr = (key, fallback) => {
        const value = t(key);
        return value && value !== key ? value : fallback;
    };

    return (
        <main>
            <AboutHero
                title={hero.title}
                highlight={hero.highlight}
                description={hero.description ?? hero.text ?? hero.subtitle}
                badge={{
                    title: tr('learn_badgeTitle', 'نروي قصة نجاح'),
                    text: tr('learn_badgeText', 'لأكثر من ٨ سنوات'),
                }}
            />
            <StorySection story={content.story} moreHref={null} />
            <FeaturesBento features={content.features} />
            <VisionMission
                vision={{
                    title: tr('learn_visionTitle', 'رؤيتنا'),
                    text: tr(
                        'learn_visionText',
                        'أن نكون الخيار الأول والأكثر ثقة في تقديم الحلول المبتكرة والخدمات المتكاملة التي تدعم نمو عملائنا وتحقق تطلعاتهم.'
                    ),
                }}
                mission={{
                    title: tr('learn_missionTitle', 'رسالتنا'),
                    text: tr(
                        'learn_missionText',
                        'نلتزم بتقديم منتجات وخدمات عالية الجودة تلبّي احتياجات عملائنا، معتمدين على الخبرة والابتكار والشراكات طويلة الأمد.'
                    ),
                }}
                imageAlt={tr('learn_visionTitle', 'رؤيتنا')}
            />
            <Faq
                id="faq"
                eyebrow={headings.faq.eyebrow}
                title={headings.faq.title}
                highlight={headings.faq.highlight}
                items={content.faqs}
            />
            <CtaBanner
                title={t('learn_ctaTitle')}
                description={t('learn_ctaText')}
                primary={{ label: t('learn_ctaPrimary'), href: '/#contact' }}
                secondary={{ label: t('learn_ctaSecondary'), href: '/products' }}
            />
        </main>
    );
}