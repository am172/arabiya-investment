'use client';

import { useT } from '@/components/providers/TextsProvider';
import { getThumbnail, getVimeoId, getYouTubeId } from '@/lib/utils/video';

export default function VideoPlayer({ video }) {
  const t = useT();
  const youtubeId = video.source === 'youtube' ? getYouTubeId(video.videoUrl) : null;
  const vimeoId = video.source === 'vimeo' ? getVimeoId(video.videoUrl) : null;
  const frame = 'aspect-video w-full bg-black';

  if (youtubeId) {
    return (
      <iframe
        title={video.title}
        src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        className={frame}
      />
    );
  }

  if (vimeoId) {
    return (
      <iframe
        title={video.title}
        src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1`}
        allow="autoplay; picture-in-picture; fullscreen"
        allowFullScreen
        className={frame}
      />
    );
  }

  if (video.source === 'upload') {
    return (
      <video
        src={video.videoUrl}
        poster={getThumbnail(video) || undefined}
        controls
        autoPlay
        playsInline
        className={frame}
      />
    );
  }

  return (
    <div className={`${frame} flex items-center justify-center p-6 text-center text-sm text-white`}>
      <a href={video.videoUrl} target="_blank" rel="noopener noreferrer" className="underline">
        {t('showcase_openNewTab')}
      </a>
    </div>
  );
}