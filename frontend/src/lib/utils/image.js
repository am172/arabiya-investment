const MARKER = '/upload/';

export const optimizeImage = (url, width = 1400) => {
    try {
        const parsed = new URL(url);
        if (parsed.hostname !== 'res.cloudinary.com' || !url.includes(MARKER)) return url;
        return url.replace(MARKER, `${MARKER}f_auto,q_auto,c_limit,w_${width}/`);
    } catch (error) {
        return url;
    }
};