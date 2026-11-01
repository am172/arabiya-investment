import { ArrowUpRight, CheckCircle2, Mail, MapPin, Phone } from 'lucide-react';
import ContactForm from '@/components/forms/ContactForm';
import Reveal from '@/components/ui/Reveal';
import SectionTitle from '@/components/ui/SectionTitle';
import { getT } from '@/lib/serverTexts';
import { getHeadings } from '@/lib/headings';

function WhatsappIcon({ size = 24, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

const CARD_CLASS =
  'group relative flex items-center gap-4 overflow-hidden rounded-theme border border-border bg-background/60 p-4 transition duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10';

const ICON_CLASS =
  'relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary transition duration-300 group-hover:-rotate-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/30 dark:bg-primary dark:text-primary-foreground';

const VALUE_CLASS =
  'block break-words font-medium text-start transition-colors duration-300 rtl:text-right group-hover:text-primary dark:group-hover:text-foreground';

export default async function ContactSection({ packages, contact }) {
  const t = await getT();
  const heading = getHeadings(t).contact;
  const perks = [t('contact_perk1'), t('contact_perk2'), t('contact_perk3')];
  const whatsappDigits = String(contact.whatsapp || '').replace(/\D/g, '');

  const items = [
    contact.email && {
      icon: Mail,
      label: t('contact_labelEmail'),
      value: contact.email,
      href: `mailto:${contact.email}`
    },
    contact.phone && {
      icon: Phone,
      label: t('contact_labelPhone'),
      value: contact.phone,
      href: `tel:${contact.phone.replace(/\s/g, '')}`
    },
    whatsappDigits && {
      icon: WhatsappIcon,
      label: t('contact_labelWhatsapp'),
      value: contact.whatsapp,
      href: `https://wa.me/${whatsappDigits}`
    },
    contact.address && { icon: MapPin, label: t('contact_labelAddress'), value: contact.address }
  ].filter(Boolean);

  return (
    <section
      id="contact"
      className="relative py-20 overflow-hidden border-t scroll-mt-20 border-border bg-surface sm:py-28"
    >
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute -start-32 top-0 h-96 w-96 rounded-full bg-primary/15 blur-[130px]" />
        <div className="absolute -end-32 bottom-0 h-96 w-96 rounded-full bg-accent/15 blur-[130px]" />
      </div>

      <div className="relative grid gap-12 px-5 mx-auto max-w-7xl sm:px-8 lg:grid-cols-5 lg:gap-16">
        <div className="lg:col-span-2">
          <SectionTitle align="left" {...heading} />

          <Reveal delay={0.1} className="mt-8">
            <ul className="space-y-3">
              {perks.map((perk) => (
                <li key={perk} className="flex items-center gap-3 text-sm font-medium">
                  <CheckCircle2 size={18} className="shrink-0 text-success" />
                  {perk}
                </li>
              ))}
            </ul>
          </Reveal>

          {items.length > 0 && (
            <Reveal delay={0.2} className="mt-10">
              <ul className="space-y-3">
                {items.map(({ icon: Icon, label, value, href }) => {
                  const content = (
                    <>
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 transition duration-300 opacity-0 bg-gradient-to-r from-primary/10 via-accent/5 to-transparent group-hover:opacity-100 rtl:bg-gradient-to-l"
                      />
                      <span className={ICON_CLASS}>
                        <Icon size={20} />
                      </span>
                      <span className="relative flex-1 min-w-0">
                        <span className="block text-xs font-semibold text-muted">{label}</span>
                        <span dir={href ? 'ltr' : undefined} className={VALUE_CLASS}>
                          {value}
                        </span>
                      </span>
                      {href && (
                        <ArrowUpRight
                          size={18}
                          className="relative shrink-0 text-muted transition duration-300 rtl:-scale-x-100 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary rtl:group-hover:-translate-x-0.5 dark:group-hover:text-foreground"
                        />
                      )}
                    </>
                  );

                  return (
                    <li key={label}>
                      {href ? (
                        <a
                          href={href}
                          className={CARD_CLASS}
                          {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        >
                          {content}
                        </a>
                      ) : (
                        <div className={CARD_CLASS}>{content}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Reveal>
          )}
        </div>

        <Reveal delay={0.15} className="relative lg:col-span-3">
          <div
            aria-hidden="true"
            className="absolute -inset-2 rounded-theme bg-gradient-to-br from-primary/30 via-accent/20 to-secondary/30 opacity-60 blur-2xl"
          />
          <div className="relative p-6 border shadow-xl rounded-theme border-border bg-background/80 backdrop-blur-xl sm:p-10">
            <ContactForm packages={packages || []} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}