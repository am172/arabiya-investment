'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Plus } from 'lucide-react';
import Button from './Button';
import Reveal from './Reveal';
import SectionTitle from './SectionTitle';
import { useT } from '@/components/providers/TextsProvider';

export default function Faq({
  id,
  eyebrow,
  title,
  highlight,
  items,
  limit,
  moreHref,
  moreLabel,
  surface = false
}) {
  const t = useT();
  const [openIndex, setOpenIndex] = useState(0);

  if (!items || items.length === 0) return null;

  const visible = limit ? items.slice(0, limit) : items;
  const hasMore = Boolean(limit && moreHref && items.length > limit);
  const card = surface ? 'bg-background' : 'bg-surface';

  return (
    <section
      id={id}
      className={`relative scroll-mt-20 overflow-hidden py-16 sm:py-24 ${
        surface ? 'border-y border-border bg-surface' : 'bg-background'
      }`}
    >
      <div className="max-w-3xl px-5 mx-auto sm:px-8">
        <SectionTitle eyebrow={eyebrow} title={title} highlight={highlight} />
        <ul className="mt-12 space-y-3">
          {visible.map((item, index) => {
            const open = openIndex === index;
            return (
              <Reveal key={`${item.question}-${index}`} as="li" delay={index * 0.06}>
                <div
                  className={`overflow-hidden rounded-2xl border transition-colors ${card} ${
                    open ? 'border-primary/50' : 'border-border'
                  }`}
                >
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setOpenIndex(open ? -1 : index)}
                    className="flex items-center justify-between w-full gap-4 px-5 py-4 text-start sm:px-6 sm:py-5"
                  >
                    <span className="text-base font-semibold sm:text-lg">{item.question}</span>
                    <motion.span
                      animate={{ rotate: open ? 45 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex items-center justify-center w-8 h-8 rounded-full shrink-0 bg-primary/10 text-primary"
                    >
                      <Plus size={18} />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <p className="px-5 pb-5 text-sm leading-relaxed text-muted sm:px-6 sm:text-base">
                          {item.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </ul>

        {hasMore && (
          <Reveal className="flex justify-center mt-10">
            <Button href={moreHref} variant="outline" size="lg" data-track="faq-see-all">
              {moreLabel || t('faq_seeAll')}
              <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
            </Button>
          </Reveal>
        )}
      </div>
    </section>
  );
}