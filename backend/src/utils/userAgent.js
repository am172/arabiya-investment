const BOT =
    /bot|crawl|spider|slurp|facebookexternalhit|headless|lighthouse|pagespeed|uptime|monitor|curl|wget|python|axios|node-fetch|go-http|postman|java\/|libwww|scrapy/i;

const detectCategory = (ua) => {
    if (/ipad|tablet|playbook|silk/i.test(ua) || (/android/i.test(ua) && !/mobile/i.test(ua))) {
        return 'tablet';
    }
    if (/mobi|iphone|ipod|windows phone/i.test(ua)) return 'mobile';
    return 'desktop';
};

const detectOs = (ua) => {
    if (/windows phone/i.test(ua)) return 'Windows Phone';
    if (/windows/i.test(ua)) return 'Windows';
    if (/iphone|ipad|ipod/i.test(ua)) return 'iOS';
    if (/android/i.test(ua)) return 'Android';
    if (/cros/i.test(ua)) return 'Chrome OS';
    if (/mac os x|macintosh/i.test(ua)) return 'macOS';
    if (/linux|x11/i.test(ua)) return 'Linux';
    return 'Other';
};

const detectBrowser = (ua) => {
    if (/edg(e|a|ios)?\//i.test(ua)) return 'Edge';
    if (/opr\/|opera/i.test(ua)) return 'Opera';
    if (/samsungbrowser/i.test(ua)) return 'Samsung Internet';
    if (/firefox|fxios/i.test(ua)) return 'Firefox';
    if (/chrome|chromium|crios/i.test(ua)) return 'Chrome';
    if (/safari/i.test(ua)) return 'Safari';
    return 'Other';
};

const parseUserAgent = (value) => {
    const ua = String(value || '').slice(0, 400);
    return {
        isBot: ua.length === 0 || BOT.test(ua),
        category: detectCategory(ua),
        os: detectOs(ua),
        browser: detectBrowser(ua)
    };
};

module.exports = parseUserAgent;