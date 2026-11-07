'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring
} from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Logo from './Logo';
import SectionLink from './SectionLink';
import ThemeToggle from './ThemeToggle';
import Button from '@/components/ui/Button';
import { useT } from '@/components/providers/TextsProvider';
import { buildNavigation } from '@/content/navigation';
import { arabic } from '@/lib/fonts';
import LanguageSwitcher from '@/components/layout/LanguageSwitcher';

/*
 * Grid alignment: these three wrappers mirror the Hero's geometry exactly
 * (outer max-w-[1280px] px-4 sm:px-6 -> lg:px-12 gutter -> card max-w-[1120px] / 560px on mobile)
 * so the logo and the CTA sit on the same vertical lines as the Hero card edges.
 */
const SHELL_OUTER = 'mx-auto max-w-[1280px] px-4 sm:px-6';
const SHELL_GUTTER = 'lg:px-12';
const SHELL_INNER = 'mx-auto w-full max-w-[560px] lg:max-w-[1120px]';

const CTA_STYLE =
  '!rounded-full !bg-[#1D4ED8] !px-6 !py-2.5 !font-medium !text-white !shadow-sm hover:!bg-[#1E40AF] ' +
  'dark:!bg-[#1E50E2] dark:hover:!bg-[#1E40AF]';

export default function Navbar({ siteName, logo }) {
  const t = useT();
  const navigation = useMemo(() => buildNavigation(t), [t]);
  const pathname = usePathname();
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('home');

  useMotionValueEvent(scrollY, 'change', (value) => setScrolled(value > 24));

  useEffect(() => {
    setScrolled(window.scrollY > 24);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (pathname !== '/') return undefined;
    const elements = navigation.links
      .map((link) => document.getElementById(link.id))
      .filter(Boolean);
    if (elements.length === 0) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [pathname, navigation]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  const solid = scrolled || open;

  const isLinkActive = (link) =>
    link.href.startsWith('/#') ? pathname === '/' && active === link.id : pathname === link.href;

  return (
    <header
      className={`${arabic.variable} fixed inset-x-0 top-0 z-50 border-b font-arabic transition-colors duration-500 ${solid
        ? 'border-border/60 bg-background/80 shadow-sm backdrop-blur-xl'
        : 'border-transparent bg-transparent'
        }`}
    >
      <div className={SHELL_OUTER}>
        <div className={SHELL_GUTTER}>
          <div
            className={`${SHELL_INNER} grid grid-cols-[1fr_auto_1fr] items-center transition-[height] duration-500 lg:flex lg:justify-between ${scrolled ? 'h-[4.5rem] lg:h-24' : 'h-20 lg:h-28'
              }`}
          >
            <button
              type="button"
              aria-label={open ? t('nav_closeMenu') : t('nav_openMenu')}
              aria-expanded={open}
              onClick={() => setOpen((value) => !value)}
              className="flex items-center justify-center transition border rounded-full h-11 w-11 justify-self-start border-border bg-surface/70 text-foreground backdrop-blur-md hover:border-foreground/30 hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 lg:hidden"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>

            <Logo
              siteName={siteName}
              logo={logo}
              className="justify-self-center"
              imageClassName={`max-w-[12rem] transition-[height] duration-500 sm:max-w-[14rem] lg:max-w-[20rem] ${scrolled ? 'h-12 lg:h-16' : 'h-14 lg:h-20'
                }`}
              iconClassName="h-12 w-12 lg:h-14 lg:w-14"
              textClassName="text-xl sm:text-2xl lg:text-3xl"
            />

            <nav aria-label={t('nav_primaryLabel')} className="items-center hidden gap-1 lg:flex">
              {navigation.links.map((link) => {
                const isActive = isLinkActive(link);
                return (
                  <SectionLink
                    key={link.id}
                    href={link.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`relative rounded-full px-4 py-2 text-[0.95rem] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 ${isActive
                      ? 'text-slate-900 dark:text-white'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                      }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill"
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        className="absolute inset-0 rounded-full bg-slate-200/70 dark:inset-x-4 dark:bottom-1 dark:top-auto dark:h-[2px] dark:bg-white"
                      />
                    )}
                    <span className="relative">{link.label}</span>
                  </SectionLink>
                );
              })}
            </nav>

            <div className="flex items-center gap-3 justify-self-end">
              <ThemeToggle />
              <div className="hidden lg:block">
                <LanguageSwitcher />
              </div>
              <Button
                href={navigation.cta.href}
                size="sm"
                className={`hidden sm:inline-flex ${CTA_STYLE}`}
                data-track="nav-cta"
              >
                {navigation.cta.label}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            aria-label={t('nav_mobileLabel')}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="px-4 overflow-hidden sm:px-6 lg:hidden"
          >
            <ul className="flex flex-col gap-1 pt-2 pb-6 mx-auto max-w-[560px]">
              {navigation.links.map((link, index) => {
                const isActive = isLinkActive(link);
                return (
                  <motion.li
                    key={link.id}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.06 * index, duration: 0.35 }}
                  >
                    <SectionLink
                      href={link.href}
                      onClick={() => setOpen(false)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`flex items-center justify-between rounded-xl px-4 py-3 text-start text-base font-semibold text-slate-900 transition hover:bg-slate-200/70 dark:text-white dark:hover:bg-white/10 ${isActive ? 'bg-slate-200/70 dark:bg-white/10' : ''
                        }`}
                    >
                      {link.label}
                    </SectionLink>
                  </motion.li>
                );
              })}
              <motion.li
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.06 * navigation.links.length, duration: 0.35 }}
                className="flex items-center justify-between px-4 py-3 mt-2 border rounded-xl border-border/60"
              >
                <span className="text-base font-semibold text-foreground">
                  {t('nav_language')}
                </span>
                <LanguageSwitcher />
              </motion.li>
              <li className="pt-3 sm:hidden">
                <Button
                  href={navigation.cta.href}
                  onClick={() => setOpen(false)}
                  className={`w-full ${CTA_STYLE}`}
                  data-track="nav-cta-mobile"
                >
                  {navigation.cta.label}
                </Button>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>

      {scrolled && (
        <motion.div
          aria-hidden="true"
          style={{ scaleX: progress }}
          className="absolute bottom-0 start-0 h-[2px] w-full origin-left bg-gradient-to-r from-primary via-accent to-secondary rtl:origin-right rtl:bg-gradient-to-l"
        />
      )}
    </header>
  );
}