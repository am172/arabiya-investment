import { Fragment } from 'react';
import HeroSection from '@/components/sections/HeroSection';
import StatsSection from '@/components/sections/StatsSection';
import CategoriesSection from '@/components/sections/CategoriesSection';
import FeaturedProductsSection from '@/components/sections/FeaturedProductsSection';
import FeaturesMarquee from '@/components/sections/FeaturesMarquee';
import FeaturesBento from '@/components/sections/FeaturesBento';
import FeaturesList from '@/components/sections/FeaturesList';
import IndustriesSection from '@/components/sections/IndustriesSection';
import StepsTimeline from '@/components/sections/StepsTimeline';
import StepsCards from '@/components/sections/StepsCards';
import StepsBento from '@/components/sections/StepsBento';
import StorySection from '@/components/sections/StorySection';
import ShowcaseSection from '@/components/sections/ShowcaseSection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import TestimonialsAlt from '@/components/sections/TestimonialsAlt';
import ContactSection from '@/components/sections/ContactSection';
import Faq from '@/components/ui/Faq';
import JsonLd from '@/components/seo/JsonLd';
import { getStats } from '@/lib/api/stats';
import { getVideos } from '@/lib/api/videos';
import { getTestimonials } from '@/lib/api/testimonials';
import { getSettings } from '@/lib/api/settings';
import { getContent } from '@/lib/api/content';
import { getCategories, getFeaturedProducts } from '@/lib/api/catalog';
import { getT } from '@/lib/serverTexts';
import { getHeadings } from '@/lib/headings';
import { resolveContent } from '@/lib/content';
import { resolveSections } from '@/lib/sections';

export const revalidate = 60;

export default async function HomePage() {
  const [stats, categories, featured, videos, testimonials, settings, rawContent, t] = await Promise.all([
    getStats(),
    getCategories(),
    getFeaturedProducts(8),
    getVideos(),
    getTestimonials(),
    getSettings(),
    getContent(),
    getT()
  ]);

  const content = resolveContent(rawContent);
  const sections = resolveSections(rawContent && rawContent.sections);
  const headings = getHeadings(t);
  const variantOf = (key) => (sections.find((item) => item.key === key) || {}).variant;

  const blocks = {
    stats: <StatsSection stats={stats} />,
    categories: <CategoriesSection categories={categories} variant={variantOf('categories')} />,
    featuredProducts: <FeaturedProductsSection products={featured} variant={variantOf('featuredProducts')} />,
    features: {
      marquee: <FeaturesMarquee features={content.features} />,
      bento: <FeaturesBento features={content.features} />,
      list: <FeaturesList features={content.features} />
    }[variantOf('features')],
    industries: <IndustriesSection industries={content.subjects} variant={variantOf('industries')} />,
    steps: {
      timeline: <StepsTimeline steps={content.steps} heading={headings.steps} />,
      cards: <StepsCards steps={content.steps} heading={headings.steps} />,
      bento: <StepsBento steps={content.steps} heading={headings.steps} />
    }[variantOf('steps')],
    story: <StorySection story={content.story} variant={variantOf('story')} />,
    showcase: <ShowcaseSection videos={videos} heading={headings.showcase} />,
    testimonials:
      variantOf('testimonials') === 'wall' ? (
        <TestimonialsSection testimonials={testimonials} />
      ) : (
        <TestimonialsAlt testimonials={testimonials} variant={variantOf('testimonials')} />
      ),
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
    contact: <ContactSection packages={[]} contact={(settings && settings.contact) || {}} />
  };

  return (
    <main>
      <JsonLd settings={settings} />
      <HeroSection
        hero={{
          ...content.hero,
          slides: (rawContent && rawContent.hero && rawContent.hero.slides) || [],
          slider: rawContent && rawContent.hero ? rawContent.hero.slider : undefined
        }}
        stats={stats}
      />
      {sections
        .filter((section) => section.enabled)
        .map((section) => (
          <Fragment key={section.key}>{blocks[section.key]}</Fragment>
        ))}
    </main>
  );
}