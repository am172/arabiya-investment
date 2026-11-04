import PageHero from '@/components/ui/PageHero';
import CtaBanner from '@/components/ui/CtaBanner';
import StorySection from '@/components/sections/StorySection';
import FeaturesBento from '@/components/sections/FeaturesBento';
import { getContent } from '@/lib/api/content';
import { getT } from '@/lib/serverTexts';
import { getHeadings } from '@/lib/headings';
import { resolveContent } from '@/lib/content';

export const revalidate = 60;

export async function generateMetadata() {
    const t = await getT();
    return { title: t('meta_about') };
}

export default async function AboutPage() {
    const [raw, t] = await Promise.all([getContent(), getT()]);
    const content = resolveContent(raw);

    return (
        <main>
            <PageHero {...getHeadings(t).aboutHero} />
            <StorySection story={content.story} />
            <FeaturesBento features={content.features} />
            <CtaBanner
                title={t('about_ctaTitle')}
                description={t('about_ctaText')}
                primary={{ label: t('about_ctaPrimary'), href: '/#contact' }}
                secondary={{ label: t('about_ctaSecondary'), href: '/products' }}
            />
        </main>
    );
}