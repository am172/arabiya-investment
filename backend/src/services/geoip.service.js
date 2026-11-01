let engine = null;
let failed = false;

const enabled = () => String(process.env.GEOIP_ENABLED || '').toLowerCase() === 'true';

const lookup = (ip) => {
    if (!enabled() || failed) return null;
    try {
        if (!engine) engine = require('geoip-lite');
        return engine.lookup(ip);
    } catch (error) {
        failed = true;
        return null;
    }
};

module.exports = { lookup, enabled };