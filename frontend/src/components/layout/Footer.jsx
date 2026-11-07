import Link from 'next/link';
import { Facebook, Instagram, Mail, MapPin, Music2, Phone, Twitter, Youtube, FileText } from 'lucide-react';
import Logo from './Logo';
import SectionLink from './SectionLink';
import { buildNavigation } from '@/content/navigation';
import { getT } from '@/lib/serverTexts';

const SOCIALS = [
  { key: 'facebook', label: 'Facebook', icon: Facebook },
  { key: 'instagram', label: 'Instagram', icon: Instagram },
  { key: 'youtube', label: 'YouTube', icon: Youtube },
  { key: 'tiktok', label: 'TikTok', icon: Music2 },
  { key: 'twitter', label: 'Twitter', icon: Twitter }
];

const SOCIAL_CLASS =
  'flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted transition duration-300 hover:-translate-y-1 hover:border-primary hover:bg-primary hover:text-primary-foreground dark:border-primary dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/80';

const LINK_CLASS = 'transition-colors duration-300 hover:text-primary dark:hover:text-foreground';

const CONTACT_ICON_CLASS =
  'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary dark:text-primary-foreground';

export default async function Footer({ siteName, logo, tagline, contact, socialLinks }) {
  const t = await getT();
  const navigation = buildNavigation(t);
  const socials = SOCIALS.filter((item) => socialLinks[item.key]);
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-border bg-surface">
      <div className="px-5 pt-16 mx-auto max-w-7xl sm:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Logo
              siteName={siteName}
              logo={logo}
              plate
              imageClassName="h-14 max-w-[16rem] lg:h-16"
              iconClassName="h-12 w-12"
              textClassName="text-xl"
            />
            <p className="max-w-sm mt-5 text-sm leading-7 text-muted">
              {tagline || t('footer_description')}
            </p>

            <div className="mt-6">
              <a
                href="/company-profile.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary transition-all hover:-translate-y-0.5 hover:bg-primary hover:text-primary-foreground dark:bg-primary/20 dark:hover:bg-primary"
              >
                <FileText size={18} />
                <span> بروفايل الشركة</span>
              </a>
            </div>

            {socials.length > 0 && (
              <ul className="flex flex-wrap gap-3 mt-6">
                {socials.map(({ key, label, icon: Icon }) => (
                  <li key={key}>
                    <a
                      href={socialLinks[key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className={SOCIAL_CLASS}
                    >
                      <Icon size={18} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h4 className="text-sm font-bold text-foreground">{t('footer_explore')}</h4>
            <ul className="mt-5 space-y-3">
              {navigation.links.map((link) => (
                <li key={link.id}>
                  <SectionLink href={link.href} className={`text-sm text-muted ${LINK_CLASS}`}>
                    {link.label}
                  </SectionLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-foreground">{t('footer_contact')}</h4>
            <ul className="mt-5 space-y-3 text-sm text-muted">
              {contact.email && (
                <li className="flex items-start gap-3">
                  <span className={CONTACT_ICON_CLASS}>
                    <Mail size={14} />
                  </span>
                  <a
                    href={`mailto:${contact.email}`}
                    dir="ltr"
                    className={`break-all pt-1 ${LINK_CLASS}`}
                  >
                    {contact.email}
                  </a>
                </li>
              )}
              {contact.phone && (
                <li className="flex items-start gap-3">
                  <span className={CONTACT_ICON_CLASS}>
                    <Phone size={14} />
                  </span>
                  <a
                    href={`tel:${contact.phone.replace(/\s/g, '')}`}
                    dir="ltr"
                    className={`pt-1 ${LINK_CLASS}`}
                  >
                    {contact.phone}
                  </a>
                </li>
              )}
              {contact.address && (
                <li className="flex items-start gap-3">
                  <span className={CONTACT_ICON_CLASS}>
                    <MapPin size={14} />
                  </span>
                  <span className="pt-1">{contact.address}</span>
                </li>
              )}
              {!contact.email && !contact.phone && !contact.address && (
                <li>{t('footer_noContact')}</li>
              )}
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 py-6 text-sm border-t mt-14 border-border text-muted sm:flex-row">
          <p>
            © {year} {siteName}. {t('footer_rights')}
          </p>
          <div className="flex items-center gap-5">
            <Link href="/privacy-policy" className={LINK_CLASS}>
              {t('footer_privacy')}
            </Link>
            <Link href="/terms" className={LINK_CLASS}>
              {t('footer_terms')}
            </Link>
          </div>
        </div>
      </div>

      <p
        aria-hidden="true"
        className="pointer-events-none -mb-[0.2em] select-none overflow-hidden whitespace-nowrap bg-gradient-to-b from-foreground/10 to-transparent bg-clip-text text-center font-heading text-[16vw] font-extrabold leading-none tracking-tighter text-transparent lg:text-[11rem]"
      >
        {siteName}
      </p>
    </footer>
  );
}