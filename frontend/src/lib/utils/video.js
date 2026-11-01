const ID = /^[\w-]{6,}$/;

export const getYouTubeId = (url) => {
    try {
        const parsed = new URL(url);
        let id = null;
        if (parsed.hostname === 'youtu.be') {
            id = parsed.pathname.slice(1);
        } else if (parsed.hostname.includes('youtube')) {
            if (parsed.pathname === '/watch') {
                id = parsed.searchParams.get('v');
            } else {
                const match = parsed.pathname.match(/^\/(embed|shorts|live|v)\/([\w-]+)/);
                id = match ? match[2] : null;
            }
        }
        return id && ID.test(id) ? id : null;
    } catch (error) {
        return null;
    }
};

export const getVimeoId = (url) => {
    try {
        const match = new URL(url).pathname.match(/(\d{5,})/);
        return match ? match[1] : null;
    } catch (error) {
        return null;
    }
};

export const getThumbnail = (video) => {
    if (video.thumbnail && video.thumbnail.url) return video.thumbnail.url;
    if (video.source === 'youtube') {
        const id = getYouTubeId(video.videoUrl);
        if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    }
    return '';
};

export const formatDuration = (seconds) => {
    const total = Math.round(Number(seconds) || 0);
    if (!total) return '';
    const minutes = Math.floor(total / 60);
    const rest = total % 60;
    return `${minutes}:${String(rest).padStart(2, '0')}`;
};