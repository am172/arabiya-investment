import { Fragment } from 'react';
import HeroSection from '@/components/sections/HeroSection';
import StatsSection from '@/components/sections/StatsSection';
import FeaturesMarquee from '@/components/sections/FeaturesMarquee';
import FeaturesBento from '@/components/sections/FeaturesBento';
import FeaturesList from '@/components/sections/FeaturesList';
import StepsTimeline from '@/components/sections/StepsTimeline';
import StepsCards from '@/components/sections/StepsCards';
import StepsBento from '@/components/sections/StepsBento';
import SubjectsSection from '@/components/sections/SubjectsSection';
import TeachersSection from '@/components/sections/TeachersSection';
import TeachersGrid from '@/components/sections/TeachersGrid';
import TeachersFeatured from '@/components/sections/TeachersFeatured';
import ShowcaseSection from '@/components/sections/ShowcaseSection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import TestimonialsAlt from '@/components/sections/TestimonialsAlt';
import PackagesSection from '@/components/sections/PackagesSection';
import ContactSection from '@/components/sections/ContactSection';
import StorySection from '@/components/sections/StorySection';
import Faq from '@/components/ui/Faq';
import JsonLd from '@/components/seo/JsonLd';
import { getStats } from '@/lib/api/stats';
import { getTeachers } from '@/lib/api/teachers';
import { getVideos } from '@/lib/api/videos';
import { getTestimonials } from '@/lib/api/testimonials';
import { getPackages } from '@/lib/api/packages';
import { getSettings } from '@/lib/api/settings';
import { getContent } from '@/lib/api/content';
import { getT } from '@/lib/serverTexts';
import { getHeadings } from '@/lib/headings';
import { resolveContent } from '@/lib/content';
import { resolveSections } from '@/lib/sections';

export const revalidate = 60;

export default async function HomePage() {
  const [stats, teachers, videos, testimonials, packages, settings, rawContent, t] =
    await Promise.all([
      getStats(),
      getTeachers(),
      getVideos(),
      getTestimonials(),
      getPackages(),
      getSettings(),
      getContent(),
      getT()
    ]);

  const content = resolveContent(rawContent);
  const sections = resolveSections(rawContent && rawContent.sections);
  const headings = getHeadings(t);
  const variantOf = (key) => (sections.find((item) => item.key === key) || {}).variant;

  const blocks = {
    story: <StorySection story={content.story} variant={variantOf('story')} />,
    stats: <StatsSection stats={stats} />,
    features: {
      marquee: <FeaturesMarquee features={content.features} />,
      bento: <FeaturesBento features={content.features} />,
      list: <FeaturesList features={content.features} />
    }[variantOf('features')],
    steps: {
      timeline: <StepsTimeline steps={content.steps} heading={headings.steps} />,
      cards: <StepsCards steps={content.steps} heading={headings.steps} />,
      bento: <StepsBento steps={content.steps} heading={headings.steps} />
    }[variantOf('steps')],
    subjects: <SubjectsSection subjects={content.subjects} variant={variantOf('subjects')} />,
    teachers: {
      carousel: <TeachersSection teachers={teachers} heading={headings.teachers} />,
      grid: <TeachersGrid teachers={teachers} heading={headings.teachers} />,
      featured: <TeachersFeatured teachers={teachers} heading={headings.teachers} />
    }[variantOf('teachers')],
    showcase: <ShowcaseSection videos={videos} heading={headings.showcase} />,
    testimonials:
      variantOf('testimonials') === 'wall' ? (
        <TestimonialsSection testimonials={testimonials} />
      ) : (
        <TestimonialsAlt testimonials={testimonials} variant={variantOf('testimonials')} />
      ),
    packages: <PackagesSection packages={packages} variant={variantOf('packages')} />,
    faq: (
      <Faq
        id="faq"
        surface
        eyebrow={headings.faq.eyebrow}
        title={headings.faq.title}
        highlight={headings.faq.highlight}
        items={content.faqs}
        limit={4}
        moreHref="/learn-more"
      />
    ),
    contact: <ContactSection packages={packages} contact={(settings && settings.contact) || {}} />
  };

  return (
    <main>
      <JsonLd settings={settings} />
      <HeroSection hero={content.hero} stats={stats} />
      {sections
        .filter((section) => section.enabled)
        .map((section) => (
          <Fragment key={section.key}>{blocks[section.key]}</Fragment>
        ))}
    </main>
  );
}


