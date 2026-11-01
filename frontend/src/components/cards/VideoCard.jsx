'use client';

import Image from 'next/image';
import { Play, Star } from 'lucide-react';
import { useT } from '@/components/providers/TextsProvider';
import { formatDuration, getThumbnail } from '@/lib/utils/video';

export default function VideoCard({ video, large, onOpen }) {
  const t = useT();
  const thumbnail = getThumbnail(video);
  const duration = formatDuration(video.duration);
  const sizes = large
    ? '(min-width: 1024px) 66vw, 100vw'
    : '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw';

  return (
    <button
      type="button"
      onClick={() => onOpen(video)}
      aria-label={t('showcase_play', { title: video.title })}
      data-track={video.title}
      data-track-event="VIDEO_PLAY"
      className={`group relative block h-full w-full select-none overflow-hidden rounded-theme border border-border bg-surface text-start shadow-lg shadow-primary/5 transition duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        large ? 'aspect-video lg:aspect-auto lg:min-h-[26rem]' : 'aspect-video'
      }`}
    >
      {thumbnail ? (
        <Image
          src={thumbnail}
          alt=""
          fill
          draggable={false}
          sizes={sizes}
          className="object-cover transition duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/50 via-accent/30 to-secondary/40" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10" />

      {video.isFeatured && (
        <span className="absolute start-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground shadow-lg">
          <Star size={12} className="fill-current" />
          {t('showcase_featured')}
        </span>
      )}

      <span className="absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
        <span
          className={`relative flex items-center justify-center rounded-full bg-white/90 text-primary shadow-xl transition duration-300 group-hover:scale-110 ${
            large ? 'h-16 w-16 sm:h-20 sm:w-20' : 'h-14 w-14 sm:h-16 sm:w-16'
          }`}
        >
          <span className="absolute inset-0 rounded-full animate-pulse-ring bg-white/60" />
          <Play className="relative fill-current ms-1" size={large ? 28 : 22} />
        </span>
      </span>

      {duration && (
        <span className="absolute end-4 top-4 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-md">
          {duration}
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
        <h3 className={`font-bold text-white ${large ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'}`}>
          {video.title}
        </h3>
        {(video.studentName || video.studentAge) && (
          <p className="mt-1 text-sm text-white/75">
            {video.studentName}
            {video.studentName && video.studentAge ? ' · ' : ''}
            {video.studentAge ? t('showcase_age', { n: video.studentAge }) : ''}
          </p>
        )}
      </div>
    </button>
  );
}