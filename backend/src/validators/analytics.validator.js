const TYPES = ['pageview', 'event', 'duration'];
const ID = /^[A-Za-z0-9_-]{8,64}$/;
const EVENT_NAME = /^[A-Za-z0-9_:.-]{1,50}$/;

const validateTrack = (body) => {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return [{ field: 'body', message: 'Invalid payload' }];
    }

    const errors = [];
    const { type } = body;

    if (!TYPES.includes(type)) {
        errors.push({ field: 'type', message: `type must be one of: ${TYPES.join(', ')}` });
    }
    if (typeof body.sessionId !== 'string' || !ID.test(body.sessionId)) {
        errors.push({ field: 'sessionId', message: 'A valid sessionId is required' });
    }
    if ((type === 'pageview' || type === 'duration') && !ID.test(String(body.viewId || ''))) {
        errors.push({ field: 'viewId', message: 'A valid viewId is required' });
    }
    if (type === 'pageview' || type === 'event') {
        if (typeof body.path !== 'string' || !body.path.startsWith('/') || body.path.length > 500) {
            errors.push({ field: 'path', message: 'path must start with / and be under 500 characters' });
        }
    }
    if (type === 'event' && !EVENT_NAME.test(String(body.eventName || ''))) {
        errors.push({ field: 'eventName', message: 'eventName must be 1-50 safe characters' });
    }
    if (type === 'duration') {
        const duration = Number(body.duration);
        if (!Number.isFinite(duration) || duration < 0) {
            errors.push({ field: 'duration', message: 'duration must be a non-negative number' });
        }
    }

    return errors;
};

module.exports = { validateTrack };