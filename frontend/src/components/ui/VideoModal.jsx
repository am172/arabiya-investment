'use client';

import Modal from './Modal';
import VideoPlayer from './VideoPlayer';
import { useT } from '@/components/providers/TextsProvider';

export default function VideoModal({ video, open, onClose }) {
    const t = useT();

    return (
        <Modal open={open} onClose={onClose} label={video ? video.title : ''}>
            {video && (
                <div className="overflow-hidden border shadow-2xl rounded-theme border-white/10 bg-surface">
                    <VideoPlayer video={video} />
                    <div className="p-5 sm:p-6">
                        <h3 className="text-lg font-bold sm:text-xl">{video.title}</h3>
                        {(video.studentName || video.studentAge) && (
                            <p className="mt-1 text-sm font-medium text-primary">
                                {video.studentName}
                                {video.studentName && video.studentAge ? ' · ' : ''}
                                {video.studentAge ? t('showcase_age', { n: video.studentAge }) : ''}
                            </p>
                        )}
                        {video.description && (
                            <p className="mt-3 text-sm leading-relaxed text-muted">{video.description}</p>
                        )}
                    </div>
                </div>
            )}
        </Modal>
    );
}