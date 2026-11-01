'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useHiddenSections } from '@/components/providers/SectionsProvider';
import { isModifiedEvent, scrollToHash } from '@/lib/scroll';

const FALLBACK_PAGES = {
  teachers: '/teachers',
  showcase: '/student-stories',
  packages: '/packages',
  contact: '/contact'
};

const resolveHref = (href, hidden) => {
  if (typeof href !== 'string') return href;
  const match = /^\/?#(.+)$/.exec(href);
  if (!match) return href;
  const id = match[1];
  return hidden.has(id) && FALLBACK_PAGES[id] ? FALLBACK_PAGES[id] : href;
};

export default function SectionLink({ href, onClick, children, ...props }) {
  const pathname = usePathname();
  const hidden = useHiddenSections();
  const target = resolveHref(href, hidden);

  const handleClick = (event) => {
    if (onClick) onClick(event);
    if (event.defaultPrevented || isModifiedEvent(event) || typeof target !== 'string') return;
    if (props.target && props.target !== '_self') return;

    let url;
    try {
      url = new URL(target, window.location.href);
    } catch (error) {
      return;
    }

    if (url.origin !== window.location.origin || url.pathname !== pathname || !url.hash) return;

    event.preventDefault();

    const next = `${url.pathname}${url.search}${url.hash}`;
    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (next !== current) window.history.pushState(null, '', next);

    scrollToHash(url.hash, { smooth: true });
  };

  return (
    <Link href={target} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}