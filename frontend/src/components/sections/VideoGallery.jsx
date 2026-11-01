'use client';

import { useCallback, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import VideoCard from '@/components/cards/VideoCard';
import VideoModal from '@/components/ui/VideoModal';
import { useT } from '@/components/providers/TextsProvider';

const PAGE_SIZE = 9;

export default function VideoGallery({ videos }) {
  const t = useT();
  const [filter, setFilter] = useState('all');
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [active, setActive] = useState(null);
  const [open, setOpen] = useState(false);

  const filters = [
    { id: 'all', label: t('showcase_all') },
    { id: 'featured', label: t('showcase_featured') }
  ];

  const sorted = useMemo(
    () => [...videos].sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured)),
    [videos]
  );

  const featuredCount = useMemo(() => sorted.filter((video) => video.isFeatured).length, [sorted]);
  const showFilters = featuredCount > 0 && featuredCount < sorted.length;

  const filtered = useMemo(
    () => (filter === 'featured' ? sorted.filter((video) => video.isFeatured) : sorted),
    [sorted, filter]
  );

  const shown = filtered.slice(0, visible);

  const openVideo = useCallback((video) => {
    setActive(video);
    setOpen(true);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  const changeFilter = (id) => {
    setFilter(id);
    setVisible(PAGE_SIZE);
  };

  return (
    <div>
      {showFilters && (
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => changeFilter(item.id)}
              aria-pressed={filter === item.id}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                filter === item.id
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                  : 'border border-border bg-surface text-muted hover:border-primary hover:text-primary'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        <AnimatePresence mode="popLayout">
          {shown.map((video) => (
            <motion.li
              key={video._id}
              layout
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <VideoCard video={video} onOpen={openVideo} />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      {filtered.length > PAGE_SIZE && (
        <div className="flex flex-col items-center gap-4 mt-12">
          <p className="text-sm text-muted">
            {t('showcase_showing', { shown: shown.length, total: filtered.length })}
          </p>
          {shown.length < filtered.length && (
            <button
              type="button"
              onClick={() => setVisible((value) => value + PAGE_SIZE)}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-7 py-3 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-primary hover:text-primary"
            >
              {t('showcase_loadMore')}
              <ChevronDown size={16} />
            </button>
          )}
        </div>
      )}

      <VideoModal video={active} open={open} onClose={close} />
    </div>
  );
}