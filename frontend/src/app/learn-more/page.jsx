import PageHero from '@/components/ui/PageHero';
import CtaBanner from '@/components/ui/CtaBanner';
import Faq from '@/components/ui/Faq';
import StorySection from '@/components/sections/StorySection';
import FeaturesBento from '@/components/sections/FeaturesBento';
import { getContent } from '@/lib/api/content';
import { getT } from '@/lib/serverTexts';
import { getHeadings } from '@/lib/headings';
import { resolveContent } from '@/lib/content';

export const revalidate = 60;

export async function generateMetadata() {
    const t = await getT();
    return { title: t('meta_learnMore') };
}

export default async function LearnMorePage() {
    const [raw, t] = await Promise.all([getContent(), getT()]);
    const content = resolveContent(raw);
    const headings = getHeadings(t);

    return (
        <main>
            <PageHero {...headings.learnHero} />
            <StorySection story={content.story} />
            <FeaturesBento features={content.features} />
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
                secondary={{ label: t('learn_ctaSecondary'), href: '/#packages' }}
            />
        </main>
    );
}