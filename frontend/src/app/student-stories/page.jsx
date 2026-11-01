import PageHero from '@/components/ui/PageHero';
import CtaBanner from '@/components/ui/CtaBanner';
import VideoGallery from '@/components/sections/VideoGallery';
import { getAllVideos } from '@/lib/api/videos';
import { getT } from '@/lib/serverTexts';
import { getHeadings } from '@/lib/headings';

export const revalidate = 60;

export async function generateMetadata() {
    const t = await getT();
    return { title: t('meta_stories') };
}

export default async function StudentStoriesPage() {
    const [videos, t] = await Promise.all([getAllVideos(), getT()]);

    return (
        <main dir="rtl" lang="ar">
            <PageHero {...getHeadings(t).showcase} />

            <section className="py-16 bg-background sm:py-24">
                <div className="px-5 mx-auto max-w-7xl sm:px-8">
                    {videos.length === 0 ? (
                        <p className="text-center text-muted">{t('showcase_empty')}</p>
                    ) : (
                        <VideoGallery videos={videos} />
                    )}
                </div>
            </section>

            <CtaBanner
                title={t('showcase_ctaTitle')}
                description={t('showcase_ctaText')}
                primary={{ label: t('showcase_ctaPrimary'), href: '/#contact' }}
                secondary={{ label: t('showcase_ctaSecondary'), href: '/teachers' }}
            />
        </main>
    );
}