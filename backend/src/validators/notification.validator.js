const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateSubscription = (body) => {
    const errors = [];
    const endpoint = String(body.endpoint || '');
    const keys = body.keys || {};
    if (!/^https:\/\//.test(endpoint) || endpoint.length > 1000) {
        errors.push({ field: 'endpoint', message: 'Invalid subscription' });
    }
    if (typeof keys.p256dh !== 'string' || typeof keys.auth !== 'string') {
        errors.push({ field: 'keys', message: 'Invalid subscription' });
    }
    return errors;
};

const validateUnsubscribe = (body) =>
    typeof body.endpoint === 'string' && body.endpoint
        ? []
        : [{ field: 'endpoint', message: 'endpoint is required' }];

const validateNotificationSettings = (body) => {
    const errors = [];
    ['pushEnabled', 'emailEnabled', 'notifyAllAdmins'].forEach((field) => {
        if (body[field] !== undefined && typeof body[field] !== 'boolean') {
            errors.push({ field, message: `${field} must be a boolean` });
        }
    });
    if (body.extraRecipients !== undefined) {
        const list = body.extraRecipients;
        if (!Array.isArray(list) || list.length > 5 || list.some((item) => !EMAIL.test(String(item)))) {
            errors.push({ field: 'extraRecipients', message: 'Invalid email address' });
        }
    }
    return errors;
};

module.exports = { validateSubscription, validateUnsubscribe, validateNotificationSettings };