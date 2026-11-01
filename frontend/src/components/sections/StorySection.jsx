import SectionTitle from '@/components/ui/SectionTitle';
import Button from '@/components/ui/Button';
import Reveal from '@/components/ui/Reveal';
import { ArrowLeft } from 'lucide-react';
import { arabic, handwriting } from '@/lib/fonts';
import { getT } from '@/lib/serverTexts';
import StoryBook from './StoryBook';
import StoryEditorial from './StoryEditorial';
import StoryChapters from './StoryChapters';

export default async function StorySection({ story, variant = 'book', moreHref = '/story' }) {
    const t = await getT();
    const data = story || {};
    const paragraphs = (data.paragraphs || []).filter((text) => text && text.trim());

    if (!data.title && paragraphs.length === 0) return null;

    return (
        <section
            id="story"
            dir="rtl"
            lang="ar"
            className={`${arabic.variable} ${handwriting.variable} font-arabic relative overflow-hidden bg-background py-16 sm:py-24`}
        >
            {variant === 'editorial' ? (
                <StoryEditorial data={data} paragraphs={paragraphs} />
            ) : variant === 'chapters' ? (
                <StoryChapters
                    data={data}
                    paragraphs={paragraphs}
                    chapterLabel={(n) => t('story_chapter', { n })}
                />
            ) : (
                <StoryBook
                    paragraphs={paragraphs}
                    header={
                        <>
                            <div className="lg:hidden">
                                <SectionTitle
                                    align="center"
                                    eyebrow={data.eyebrow}
                                    title={data.title}
                                    highlight={data.highlight}
                                />
                            </div>
                            <div className="hidden lg:block">
                                <SectionTitle
                                    align="right"
                                    eyebrow={data.eyebrow}
                                    title={data.title}
                                    highlight={data.highlight}
                                />
                            </div>
                        </>
                    }
                />
            )}

            {moreHref && (
                <Reveal delay={0.1} className="flex justify-center px-5 mx-auto mt-12 max-w-7xl">
                    <Button href={moreHref} variant="outline" size="lg" className="group">
                        {t('story_more')}
                        <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
                    </Button>
                </Reveal>
            )}
        </section>
    );
}