import './globals.css';
import ThemeProvider from '@/components/providers/ThemeProvider';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { getSettings } from '@/lib/api/settings';
import { buildThemeCss, fontLinks, resolveTheme } from '@/lib/theme/applyTheme';
import AnalyticsProvider from '@/components/providers/AnalyticsProvider';
import FloatingWhatsApp from '@/components/layout/FloatingWhatsApp';
import { TextsProvider } from '@/components/providers/TextsProvider';
import { getTexts } from '@/lib/api/texts';
import { buildT } from '@/lib/texts';
import HashScroller from '@/components/providers/HashScroller';
import { arabic } from '@/lib/fonts';
import { SectionsProvider } from '@/components/providers/SectionsProvider';
import { getContent } from '@/lib/api/content';
import { getHiddenSections, resolveSections } from '@/lib/sections';
import SplashScreen, { SPLASH_SCRIPT } from '@/components/layout/SplashScreen';
import { siteBase } from '@/lib/site';
import { RequestProvider } from '@/components/providers/RequestProvider'
export const revalidate = 60;

export async function generateMetadata() {
  const [settings, texts] = await Promise.all([getSettings(), getTexts()]);
  const t = buildT(texts);
  const siteName = (settings && settings.siteName) || t('general_fallbackName');
  const seo = (settings && settings.seo) || {};
  const title = seo.title || `${siteName} | ${t('general_metaTitle')}`;
  const description = seo.description || (settings && settings.tagline) || t('general_metaDescription');
  const icon = settings && settings.favicon && settings.favicon.url;
  const logo = settings && settings.logo && settings.logo.url;

  return {
    metadataBase: siteBase(),
    title: { default: title, template: `%s | ${siteName}` },
    description,
    keywords: seo.keywords && seo.keywords.length ? seo.keywords : undefined,
    icons: icon ? { icon } : undefined,
    verification: seo.googleVerification ? { google: seo.googleVerification } : undefined,
    openGraph: {
      title,
      description,
      siteName,
      type: 'website',
      images: logo ? [{ url: logo }] : undefined
    },
    twitter: { card: 'summary', title, description, images: logo ? [logo] : undefined }
  };
}

export default async function RootLayout({ children }) {
  const [settings, texts] = await Promise.all([getSettings(), getTexts()]);
  const t = buildT(texts);
  const theme = resolveTheme(settings && settings.theme);
  const css = buildThemeCss(theme);
  const links = fontLinks(theme);
  const siteName = (settings && settings.siteName) || t('general_fallbackName');
  const logo = settings && settings.logo;

  const hiddenSections = getHiddenSections(
    resolveSections(((await getContent()) || {}).sections)
  );
  const script = `(function(){try{var s=localStorage.getItem('nebras-theme');var d=s?s==='dark':${JSON.stringify(
    theme.mode
  )}==='dark';document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {links.map((href) => (
          <link key={href} rel="stylesheet" href={href} />
        ))}
        <style id="nebras-theme" dangerouslySetInnerHTML={{ __html: css }} />
        <script dangerouslySetInnerHTML={{ __html: script }} />
      </head>
      <body className={`${arabic.variable} font-arabic`} suppressHydrationWarning>
        {process.env.NEXT_PUBLIC_SPLASH !== 'off' && (
          <>
            <script dangerouslySetInnerHTML={{ __html: SPLASH_SCRIPT }} />
            <SplashScreen siteName={siteName} logoUrl={logo && logo.url} />
          </>
        )}
        <TextsProvider values={texts}>
          <SectionsProvider hidden={hiddenSections}>
            <RequestProvider>
              <ThemeProvider>
                <AnalyticsProvider />
                <HashScroller />
                <Navbar siteName={siteName} logo={logo} />
                {children}
                <Footer
                  siteName={siteName}
                  logo={logo}
                  tagline={settings && settings.tagline}
                  contact={(settings && settings.contact) || {}}
                  socialLinks={(settings && settings.socialLinks) || {}}
                />
                <FloatingWhatsApp number={settings && settings.contact && settings.contact.whatsapp} />
              </ThemeProvider>
            </RequestProvider>
          </SectionsProvider>
        </TextsProvider>
      </body>
    </html>
  );
}